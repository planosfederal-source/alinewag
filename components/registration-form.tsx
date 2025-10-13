"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import ErrorModal from "@/components/error-modal"

const REFERRAL_ID = "15354112082025084547" // Seu ID de indicação

const BRAZILIAN_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
]

const PLANS = {
  VIVO: [
    { id: "69", name: "80GB COM LIGACAO", price: 69.9, esim: true },
    { id: "61", name: "150GB COM LIGACAO", price: 99.9, esim: true },
  ],
  TIM: [
    { id: "56", name: "100GB COM LIGACAO", price: 69.9, esim: true },
    { id: "154", name: "200GB SEM LIGAÇÃO", price: 159.9, esim: true },
    { id: "155", name: "300GB SEM LIGAÇÃO", price: 199.9, esim: true },
  ],
  CLARO: [
    { id: "57", name: "80GB COM LIGACAO", price: 69.9, esim: true },
    { id: "183", name: "150GB COM LIGACAO", price: 99.9, esim: true },
  ],
}

export default function RegistrationForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [billingId, setBillingId] = useState<string>("")
  const [orderAmount, setOrderAmount] = useState<number>(0)
  const [cpfValidated, setCpfValidated] = useState(false)
  const [emailValidated, setEmailValidated] = useState(false)
  const [showWelcomeVideo, setShowWelcomeVideo] = useState(false)

  const [formData, setFormData] = useState({
    cpf: "",
    birth: "",
    name: "",
    email: "",
    phone: "",
    cell: "",
    cep: "",
    district: "",
    city: "",
    state: "",
    street: "",
    number: "",
    complement: "",
    typeChip: "fisico",
    coupon: "",
    plan_id: "",
    typeFrete: "",
  })

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
  }

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{5})(\d{0,3})/, "$1-$2")
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value

    if (field === "cpf") {
      formattedValue = formatCPF(value)
    } else if (field === "phone" || field === "cell") {
      formattedValue = formatPhone(value)
    } else if (field === "cep") {
      formattedValue = formatCEP(value)
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }))
  }

  const fetchAddressByCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, "")
    if (cleanCEP.length !== 8) return

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const data = await response.json()

      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          street: data.logradouro || "",
          district: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        }))
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
    }
  }

  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, "")
    if (cleanCPF.length !== 11) return false

    // Validação básica de CPF
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false

    let sum = 0
    let remainder

    for (let i = 1; i <= 9; i++) {
      sum += Number.parseInt(cleanCPF.substring(i - 1, i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== Number.parseInt(cleanCPF.substring(9, 10))) return false

    sum = 0
    for (let i = 1; i <= 10; i++) {
      sum += Number.parseInt(cleanCPF.substring(i - 1, i)) * (12 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== Number.parseInt(cleanCPF.substring(10, 11))) return false

    return true
  }

  const validateCPFWithAPI = async (cpf: string, birth: string) => {
    const cleanCPF = cpf.replace(/\D/g, "")
    if (cleanCPF.length !== 11 || !birth) return

    try {
      // Format birth date from YYYY-MM-DD to DD-MM-YYYY
      const [year, month, day] = birth.split("-")
      const formattedBirth = `${day}-${month}-${year}`

      const response = await fetch(
        `https://apicpf.whatsgps.com.br/api/cpf/search?numeroDeCpf=${cleanCPF}&dataNascimento=${formattedBirth}&token=2|VL3z6OcyARWRoaEniPyoHJpPtxWcD99NN2oueGGn4acc0395`,
      )
      const data = await response.json()

      if (data.data && data.data.id) {
        // Auto-fill name and mark fields as validated
        setFormData((prev) => ({
          ...prev,
          name: data.data.nome_da_pf || prev.name,
        }))
        setCpfValidated(true)
        toast({
          title: "CPF validado!",
          description: "Dados preenchidos automaticamente.",
        })
      } else {
        toast({
          title: "CPF não encontrado",
          description: "Verifique o CPF e data de nascimento.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao validar CPF:", error)
    }
  }

  const validateEmail = async (email: string) => {
    if (!email) return

    try {
      const response = await fetch(`https://federalassociados.com.br/getEmail/${email}`)
      const data = await response.json()

      if (data.status === "success") {
        setEmailValidated(true)
        toast({
          title: "Email validado!",
          description: "Email confirmado com sucesso.",
        })
      } else if (data.status === "error") {
        toast({
          title: "Erro",
          description: data.msg || "Email já cadastrado ou inválido.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao validar email:", error)
    }
  }

  const validateCoupon = async (coupon: string) => {
    if (!coupon) return

    try {
      const response = await fetch(`https://federalassociados.com.br/getValidateCoupon/${coupon}`)
      const data = await response.json()

      if (data.status === "success") {
        toast({
          title: "Cupom válido!",
          description: data.msg || "Cupom aplicado com sucesso.",
        })
      } else if (data.status === "error") {
        toast({
          title: "Cupom inválido",
          description: data.msg || "Verifique o código do cupom.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao validar cupom:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validações
    if (!validateCPF(formData.cpf)) {
      setErrorMessage("CPF inválido! Por favor, verifique o CPF informado.")
      setShowErrorModal(true)
      setLoading(false)
      return
    }

    if (!formData.plan_id) {
      setErrorMessage("Por favor, selecione um plano antes de continuar.")
      setShowErrorModal(true)
      setLoading(false)
      return
    }

    if (!formData.typeFrete) {
      setErrorMessage("Por favor, selecione a forma de envio antes de continuar.")
      setShowErrorModal(true)
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          father: REFERRAL_ID,
          status: "0",
          type: "Recorrente",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Aguarde...",
        })

        setTimeout(() => {
          setShowWelcomeVideo(true)
        }, 1000)
      } else {
        if (response.status === 422 && data.errors) {
          const errorFields = Object.keys(data.errors)
          const errorMessages: string[] = []

          if (errorFields.includes("cpf")) {
            errorMessages.push("CPF já cadastrado no sistema!")
          }
          if (errorFields.includes("email")) {
            errorMessages.push("Email já cadastrado no sistema!")
          }
          if (errorFields.includes("cell")) {
            errorMessages.push("WhatsApp já cadastrado no sistema!")
          }

          errorFields.forEach((field) => {
            if (!["cpf", "email", "cell"].includes(field)) {
              const messages = data.errors[field] as string[]
              errorMessages.push(messages.join(", "))
            }
          })

          const finalMessage =
            errorMessages.length > 0
              ? `${errorMessages.join(" ")} Por favor, use outros dados ou entre em contato pelo WhatsApp 0800-6262-345 para correção.`
              : "Erro ao processar cadastro. Verifique os dados e tente novamente."

          setErrorMessage(finalMessage)
          setShowErrorModal(true)
        } else {
          setErrorMessage(data.message || "Erro ao processar cadastro. Verifique os dados e tente novamente.")
          setShowErrorModal(true)
        }
      }
    } catch (error) {
      setErrorMessage("Não foi possível completar o cadastro. Verifique sua conexão e tente novamente.")
      setShowErrorModal(true)
    } finally {
      setLoading(false)
    }
  }

  const getAvailablePlans = () => {
    if (formData.typeChip === "eSim") {
      return Object.entries(PLANS)
        .flat()
        .filter((plan) => plan.esim)
    }
    return Object.values(PLANS).flat()
  }

  useEffect(() => {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.src = 'https://myehbxfidszreorsaexi.supabase.co/storage/v1/object/public/adesao/adesao.mp4'
    video.load()
  }, [])

  if (showWelcomeVideo) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <iframe
          src="/welcome-video"
          className="w-full h-full border-0"
          title="Video de Boas-Vindas"
        />
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Plano e Chip */}
        <Card>
          <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Escolha seu Plano</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Chip</Label>
                <RadioGroup
                  value={formData.typeChip}
                  onValueChange={(value) => {
                    handleInputChange("typeChip", value)
                    handleInputChange("plan_id", "")
                  }}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fisico" id="fisico" />
                    <Label htmlFor="fisico" className="font-normal cursor-pointer">
                      Físico
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="eSim" id="eSim-chip" />
                    <Label htmlFor="eSim-chip" className="font-normal cursor-pointer">
                      e-SIM
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan">
                  Plano <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.plan_id}
                  onValueChange={(value) => handleInputChange("plan_id", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-sm font-semibold pointer-events-none" style={{ color: '#8B5CF6' }}>VIVO</div>
                    {PLANS.VIVO.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id} className="text-gray-900 font-medium">
                        {plan.name} - R$ {plan.price.toFixed(2).replace('.', ',')}
                      </SelectItem>
                    ))}

                    <div className="px-2 py-1.5 text-sm font-semibold mt-2 pointer-events-none" style={{ color: '#1E90FF' }}>TIM</div>
                    {PLANS.TIM.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id} className="text-gray-900 font-medium">
                        {plan.name} - R$ {plan.price.toFixed(2).replace('.', ',')}
                      </SelectItem>
                    ))}

                    <div className="px-2 py-1.5 text-sm font-semibold mt-2 pointer-events-none" style={{ color: '#DC143C' }}>CLARO</div>
                    {PLANS.CLARO.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id} className="text-gray-900 font-medium">
                        {plan.name} - R$ {plan.price.toFixed(2).replace('.', ',')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Dados Pessoais */}
        <Card>
          <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Dados Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">
                  CPF <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                  className={cpfValidated ? "border-green-500" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth">
                  Data de Nascimento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birth"
                  type="date"
                  value={formData.birth}
                  onChange={(e) => handleInputChange("birth", e.target.value)}
                  onBlur={(e) => validateCPFWithAPI(formData.cpf, e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-1">
                <Label htmlFor="name">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Seu nome completo"
                  required
                  readOnly={cpfValidated}
                  className={cpfValidated ? "border-green-500" : ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Contato</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={(e) => validateEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className={emailValidated ? "border-green-500" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Telefone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(00) 0000-0000"
                  maxLength={15}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cell">
                  Celular <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cell"
                  value={formData.cell}
                  onChange={(e) => handleInputChange("cell", e.target.value)}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Endereço</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">
                  CEP <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleInputChange("cep", e.target.value)}
                  onBlur={(e) => fetchAddressByCEP(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">
                  Bairro <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange("district", e.target.value)}
                  placeholder="Seu bairro"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">
                  Cidade <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Sua cidade"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">
                  Estado <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="street">
                  Endereço <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => handleInputChange("street", e.target.value)}
                  placeholder="Rua, Avenida, etc"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => handleInputChange("number", e.target.value)}
                  placeholder="123"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={formData.complement}
                  onChange={(e) => handleInputChange("complement", e.target.value)}
                  placeholder="Apto, Bloco, etc"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forma de Envio */}
        <Card>
          <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Forma de Envio</h2>
            <RadioGroup
              value={formData.typeFrete}
              onValueChange={(value) => handleInputChange("typeFrete", value)}
              className="space-y-3"
            >
              {formData.typeChip === "fisico" && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Carta" id="carta" />
                      <Label htmlFor="carta" className="font-normal cursor-pointer">
                        Enviar via Carta Registrada
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      Para quem vai receber o chip pelos Correios
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="semFrete" id="semFrete" />
                      <Label htmlFor="semFrete" className="font-normal cursor-pointer">
                        Retirar na Associação ou com um Associado
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      Se você vai retirar o chip pessoalmente com um representante ou no caso dos planos da Vivo, vai comprar um chip para ativar de forma imediata
                    </p>
                  </div>
                </>
              )}
              {formData.typeChip === "eSim" && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="eSim" id="eSim" />
                  <Label htmlFor="eSim" className="font-normal cursor-pointer">
                    Sem a necessidade de envio (e-SIM)
                  </Label>
                </div>
              )}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Voltar
          </Button>
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
            {loading ? "Processando..." : "Salvar"}
          </Button>
        </div>
      </form>

      <ErrorModal open={showErrorModal} onOpenChange={setShowErrorModal} message={errorMessage} />
    </>
  )
}
