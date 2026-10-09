/** Profesní kvalifikace NSK, ke které vede aplikace po bráně 4. Zkoušku pořádá Edu Partners jako autorizovaná osoba. */
export const NSK_QUALIFICATION = {
  name: "Specialista/specialistka internetového obchodu",
  code: "66-043-N",
  eqf: 5,
  authority: "Ministerstvo průmyslu a obchodu",
  url: "https://www.narodnikvalifikace.cz/kvalifikace-1469",
  unlockGate: 4,
  email: "michal.micek@edu-partners.cz",
};

export const qualificationMailto = (name?: string) =>
  `mailto:${NSK_QUALIFICATION.email}?subject=${encodeURIComponent(
    `Přihláška ke zkoušce ${NSK_QUALIFICATION.name} (${NSK_QUALIFICATION.code})`,
  )}&body=${encodeURIComponent(
    `Dobrý den,\n\nmám zájem o zkoušku profesní kvalifikace ${NSK_QUALIFICATION.name} (${NSK_QUALIFICATION.code}).${
      name ? `\nProjekt ve VISIBLE7: ${name}` : ""
    }\n\nDěkuji.`,
  )}`;
