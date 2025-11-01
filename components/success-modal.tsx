"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PartyPopper } from "lucide-react"

interface SuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SuccessModal({ open, onOpenChange }: SuccessModalProps) {
  const handleContinue = () => {
    window.location.href = "https://federalassociados.com.br/boletos"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" showCloseButton={false}>
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-50 p-4">
              <PartyPopper className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-3xl text-center font-bold">
            Parabéns! Seu cadastro foi realizado com sucesso.
          </DialogTitle>
          <DialogDescription className="text-base text-center text-foreground space-y-4">
            <p>
              Para darmos continuidade com a ativação do seu plano, é necessário realizar o pagamento da sua taxa
              associativa, no valor proporcional ao plano escolhido por você.
            </p>
            <p>
              Essa taxa é solicitada antes da ativação, pois ela confirma oficialmente a sua entrada na Federal
              Associados.
            </p>
            <p className="font-semibold">
              O valor é usado para cobrir os custos administrativos e operacionais, como:
            </p>
            <ul className="list-disc list-inside text-left mx-auto max-w-xl space-y-2">
              <li>Geração do número.</li>
              <li>Configuração da linha.</li>
              <li>Liberação do seu escritório virtual.</li>
              <li>
                E acesso a todos os benefícios exclusivos da empresa, como o Clube de Descontos, Cinema Grátis,
                Programa PBI, entre outros.
              </li>
            </ul>
            <p>
              O pagamento da taxa é o primeiro passo para liberar o seu benefício de internet móvel e garantir sua
              ativação com total segurança.
            </p>
            <p>
              Logo após efetuar o pagamento, você receberá um e-mail para fazer a biometria digital.
            </p>
            <p>Após isso já partimos para ativação do seu plano.</p>
            <p className="font-semibold text-lg mt-6">Clique no botão abaixo para continuar:</p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-12 py-6 h-auto w-full sm:w-auto"
          >
            Realizar Adesão
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
