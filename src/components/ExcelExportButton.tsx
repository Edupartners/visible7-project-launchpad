
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import { downloadExcelFile } from "@/lib/excelExport";
import { toast } from "sonner";

interface ExcelExportButtonProps {
  className?: string;
  variant?: "default" | "outline" | "secondary";
}

export const ExcelExportButton = ({ className, variant = "outline" }: ExcelExportButtonProps) => {
  const handleExport = () => {
    try {
      downloadExcelFile();
      toast.success("Excel soubor byl úspěšně stažen!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chyba při exportu do Excelu");
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant={variant}
      className={className}
    >
      <FileSpreadsheet className="w-4 h-4 mr-2" />
      Stáhnout interaktivní Excel
      <Download className="w-4 h-4 ml-2" />
    </Button>
  );
};
