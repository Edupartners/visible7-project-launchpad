-- Kontrolní otázky: 10 otázek, k osvědčení 70 % správně.
create or replace function public.quiz_start(p_project_id uuid, p_gate int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_ids text[];
  v_perms jsonb := '[]'::jsonb;
  v_perm jsonb;
  v_out jsonb := '[]'::jsonb;
  v_q record;
  v_attempt uuid;
  i int;
begin
  if v_uid is null then raise exception 'Nejste přihlášeni.'; end if;
  if not exists (select 1 from projects where id = p_project_id and user_id = v_uid) then
    raise exception 'Projekt nenalezen.';
  end if;

  select array_agg(id) into v_ids
    from (select id from quiz_questions where gate = p_gate and active order by random() limit 10) s;
  if v_ids is null or array_length(v_ids, 1) < 10 then
    raise exception 'Kontrolní otázky k této bráně zatím nejsou připravené.';
  end if;

  for i in 1 .. array_length(v_ids, 1) loop
    select * into v_q from quiz_questions where id = v_ids[i];
    select jsonb_agg(n order by random()) into v_perm from generate_series(0, 3) n;
    v_perms := v_perms || jsonb_build_array(v_perm);
    v_out := v_out || jsonb_build_array(jsonb_build_object(
      'id', v_q.id,
      'question', v_q.question,
      'options', (select jsonb_agg(v_q.options -> (p.value)::int order by p.ord)
                    from jsonb_array_elements_text(v_perm) with ordinality as p(value, ord))
    ));
  end loop;

  insert into quiz_attempts (user_id, project_id, gate, question_ids, perms)
  values (v_uid, p_project_id, p_gate, v_ids, v_perms)
  returning id into v_attempt;

  return jsonb_build_object('attempt', v_attempt, 'gate', p_gate, 'questions', v_out);
end;
$$;

create or replace function public.quiz_submit(p_attempt uuid, p_answers int[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_a record;
  v_q record;
  v_n int;
  v_correct int;
  v_score int := 0;
  v_results jsonb := '[]'::jsonb;
  v_passed boolean;
  i int;
begin
  if v_uid is null then raise exception 'Nejste přihlášeni.'; end if;
  select * into v_a from quiz_attempts where id = p_attempt and user_id = v_uid;
  if not found then raise exception 'Test nenalezen.'; end if;
  if v_a.submitted_at is not null then raise exception 'Tento test už je vyhodnocený. Spusťte nový.'; end if;
  v_n := array_length(v_a.question_ids, 1);
  if coalesce(array_length(p_answers, 1), 0) <> v_n then raise exception 'Odpovězte prosím na všechny otázky.'; end if;

  for i in 1 .. v_n loop
    select * into v_q from quiz_questions where id = v_a.question_ids[i];
    select (p.ord - 1)::int into v_correct
      from jsonb_array_elements_text(v_a.perms -> (i - 1)) with ordinality as p(value, ord)
     where p.value::int = v_q.correct;
    if p_answers[i] = v_correct then v_score := v_score + 1; end if;
    v_results := v_results || jsonb_build_array(jsonb_build_object(
      'id', v_q.id, 'chosen', p_answers[i], 'correct', v_correct,
      'ok', p_answers[i] = v_correct, 'explanation', v_q.explanation, 'topic', v_q.topic
    ));
  end loop;

  -- 70 % správně (10 otázek → 7)
  v_passed := v_score >= ceil(v_n * 0.7);
  update quiz_attempts set answers = p_answers, score = v_score, passed = v_passed, submitted_at = now()
   where id = p_attempt;

  return jsonb_build_object('score', v_score, 'total', v_n, 'passed', v_passed, 'results', v_results);
end;
$$;
