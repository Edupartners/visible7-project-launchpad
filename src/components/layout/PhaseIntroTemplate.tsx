
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, VideoIcon, BookOpen, FileText } from "lucide-react";

interface LearningPoint {
  text: string;
  color?: string;
}

interface SupportingMaterial {
  title: string;
  subtitle: string;
  icon?: React.ComponentType<any>;
}

interface PhaseIntroTemplateProps {
  title: string;
  subtitle: string;
  description: string;
  phaseNumber: number;
  icon: React.ComponentType<any>;
  learningPoints: LearningPoint[];
  supportingMaterials?: SupportingMaterial[];
  videoDescription?: string;
  estimatedTime: string;
  steps: number;
  hasAiValidation?: boolean;
  onStart: () => void;
  onBack: () => void;
  gradient?: string;
}

export const PhaseIntroTemplate = ({
  title,
  subtitle,
  description,
  phaseNumber,
  icon: Icon,
  learningPoints,
  supportingMaterials = [],
  videoDescription = `2minutové představení ${title} fáze`,
  estimatedTime,
  steps,
  hasAiValidation = false,
  onStart,
  onBack,
  gradient = "from-primary/10 to-accent/10"
}: PhaseIntroTemplateProps) => {
  
  const defaultMaterials: SupportingMaterial[] = [
    { title: `${title} - Přehled`, subtitle: "Základy metodiky a příklady", icon: FileText },
    { title: `${title} - Worksheet`, subtitle: "Prázdná šablona pro offline práci", icon: FileText },
    { title: `${title} - Template`, subtitle: "Šablona a návod k analýze", icon: FileText },
    { title: `${title} - Framework`, subtitle: "Framework a inspirace", icon: FileText }
  ];

  const materials = supportingMaterials.length > 0 ? supportingMaterials : defaultMaterials;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="card-apple p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} text-primary mx-auto mb-6 flex items-center justify-center`}>
            <Icon className="w-8 h-8" />
          </div>
          
          <Badge variant="outline" className="mb-4 bg-gradient-to-r from-primary/10 to-accent/10">
            Fáze {phaseNumber}
          </Badge>
          <h1 className="text-apple-title mb-4">{title}</h1>
          <h2 className="text-xl text-primary font-medium mb-6">{subtitle}</h2>
        </div>

        {/* Video Section */}
        <div className="mb-8">
          <div className="relative bg-muted/50 rounded-xl p-8 mb-6">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="w-full lg:w-1/2">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                  <div className="text-center">
                    <VideoIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{videoDescription}</p>
                    <p className="text-xs text-muted-foreground mt-1">(Video bude přidáno později)</p>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-1/2 space-y-4 text-left">
                <h3 className="text-lg font-semibold">Co se v této fázi naučíte?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {learningPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span 
                        className={`w-2 h-2 rounded-full mr-3 mt-2 ${point.color || 'bg-primary'}`}
                      ></span>
                      {point.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 text-left">
          <h3 className="text-lg font-semibold mb-4">Proč je {title} fáze klíčová?</h3>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p>{description}</p>
          </div>
        </div>

        {/* Supporting Materials */}
        {materials.length > 0 && (
          <div className="mb-8 p-6 bg-muted/30 rounded-xl">
            <div className="flex items-center mb-4">
              <BookOpen className="w-5 h-5 text-primary mr-2" />
              <h3 className="text-lg font-semibold">Podpůrné materiály</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Stáhněte si pracovní šablony a metodické materiály pro lepší přípravu na {title} fázi.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {materials.map((material, index) => {
                const MaterialIcon = material.icon || FileText;
                return (
                  <Button key={index} variant="outline" size="sm" className="justify-start h-auto p-3" disabled>
                    <MaterialIcon className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{material.title}</div>
                      <div className="text-xs text-muted-foreground">{material.subtitle}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
            
            <p className="text-xs text-muted-foreground mt-3 italic">
              💡 PDF materiály budou přidány později
            </p>
          </div>
        )}

        {/* Stats and CTA */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground mb-8">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
              {steps} kroků
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
              ~{estimatedTime}
            </div>
            {hasAiValidation && (
              <div className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                AI validace
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Button 
              onClick={onStart}
              className="btn-apple w-full h-12 text-base"
            >
              <Play className="mr-2 w-4 h-4" />
              Začít s {title}
            </Button>
            
            <Button 
              onClick={onBack}
              variant="ghost"
              className="w-full"
            >
              Zpět na dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
