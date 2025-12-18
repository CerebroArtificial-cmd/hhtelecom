"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  data: Record<string, any>;
  onChange: (field: string, value: any) => void;
};

export default function RulesSection({ data, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Observações Importantes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Marque somente as opções que correspondam com o analisado. Descreva os detalhes nas observações.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="regraRodovia40" checked={!!data.regraRodovia40} onCheckedChange={(v) => onChange("regraRodovia40", !!v)} />
              <Label htmlFor="regraRodovia40">Rodovia estadual &gt; 40m</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="regraRio50" checked={!!data.regraRio50} onCheckedChange={(v) => onChange("regraRio50", !!v)} />
              <Label htmlFor="regraRio50">Rio &gt; 50m</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="regraColegio50" checked={!!data.regraColegio50} onCheckedChange={(v) => onChange("regraColegio50", !!v)} />
              <Label htmlFor="regraColegio50">Colégio &gt; 50m</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="regraHospital50" checked={!!data.regraHospital50} onCheckedChange={(v) => onChange("regraHospital50", !!v)} />
              <Label htmlFor="regraHospital50">Hospital &gt; 50m</Label>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="regraAreaLivre" checked={!!data.regraAreaLivre} onCheckedChange={(v) => onChange("regraAreaLivre", !!v)} />
              <Label htmlFor="regraAreaLivre">Área locada livre e limpa</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="regraArvoresEspecie" checked={!!data.regraArvoresEspecie} onCheckedChange={(v) => onChange("regraArvoresEspecie", !!v)} />
              <Label htmlFor="regraArvoresEspecie">Árvores: informar espécie</Label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="regrasObs">Observações</Label>
          <Textarea id="regrasObs" value={data.regrasObs || ""} onChange={(e) => onChange("regrasObs", e.target.value)} rows={3} />
        </div>
      </CardContent>
    </Card>
  );
}
