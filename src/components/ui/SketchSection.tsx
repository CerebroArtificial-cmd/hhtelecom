import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ReportData } from "@/types/report";

interface SketchSectionProps {
  data: ReportData;
  onChange: (field: string, value: string) => void;
}

export default function SketchSection({ data, onChange }: SketchSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Croqui</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tamanhoTerreno">Tamanho total do terreno / Local e tamanho da área locada</Label>
          <Textarea
            id="tamanhoTerreno"
            value={data.tamanhoTerreno || ""}
            onChange={(e) => onChange("tamanhoTerreno", e.target.value)}
            placeholder="Informe as dimensões do terreno total e da área locada"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vegetacaoExistente">Vegetação existente</Label>
          <Textarea
            id="vegetacaoExistente"
            value={data.vegetacaoExistente || ""}
            onChange={(e) => onChange("vegetacaoExistente", e.target.value)}
            placeholder="Informe a vegetação existente. Dentro da área: indicar no Croqui e informar espécie. Fora da área: indicar e informar distância"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="construcoesTerreno">Construções no terreno</Label>
          <Textarea
            id="construcoesTerreno"
            value={data.construcoesTerreno || ""}
            onChange={(e) => onChange("construcoesTerreno", e.target.value)}
            placeholder="Informe as construções no terreno. Dentro da área: indicar no Croqui todas as dimensões e localização. Fora da área: indicar e informar distância"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="acesso">Acesso (largura e comprimento)</Label>
          <Textarea
            id="acesso"
            value={data.acesso || ""}
            onChange={(e) => onChange("acesso", e.target.value)}
            placeholder="Informe o acesso, com largura e comprimento"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="niveisTerreno">Níveis do terreno e da área locada em relação à rua</Label>
          <Textarea
            id="niveisTerreno"
            value={data.niveisTerreno || ""}
            onChange={(e) => onChange("niveisTerreno", e.target.value)}
            placeholder="Informe os níveis do terreno e da área locada em relação à rua"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoesGerais">Observações gerais</Label>
          <Textarea
            id="observacoesGerais"
            value={data.observacoesGerais || ""}
            onChange={(e) => onChange("observacoesGerais", e.target.value)}
            placeholder="Informe outras observações importantes sobre o site"
            rows={4}
          />
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Instruções para o Croqui:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Indicar todas as dimensões e medidas</li>
            <li>• Marcar claramente a área locada</li>
            <li>• Mostrar posição de construções, árvores e obstáculos</li>
            <li>• Indicar pontos de acesso e sua largura</li>
            <li>• Marcar diferenças de nível do terreno</li>
            <li>• Incluir referências como ruas, vizinhos, etc.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
