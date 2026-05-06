export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      auditoria_socios_mesmo_vencimento: {
        Row: {
          data_inicio: string | null
          data_vencimento: string | null
          id: number | null
          nome: string | null
          ordem_recencia: number | null
          qtd_contratos: number | null
          situacao: string | null
          soma_principal: number | null
          soma_total: number | null
          sugestao: string | null
          valor_principal: number | null
          valor_total: number | null
        }
        Insert: {
          data_inicio?: string | null
          data_vencimento?: string | null
          id?: number | null
          nome?: string | null
          ordem_recencia?: number | null
          qtd_contratos?: number | null
          situacao?: string | null
          soma_principal?: number | null
          soma_total?: number | null
          sugestao?: string | null
          valor_principal?: number | null
          valor_total?: number | null
        }
        Update: {
          data_inicio?: string | null
          data_vencimento?: string | null
          id?: number | null
          nome?: string | null
          ordem_recencia?: number | null
          qtd_contratos?: number | null
          situacao?: string | null
          soma_principal?: number | null
          soma_total?: number | null
          sugestao?: string | null
          valor_principal?: number | null
          valor_total?: number | null
        }
        Relationships: []
      }
      bot_sessao: {
        Row: {
          chat_id: number
          dados_temp: Json | null
          step: string | null
          updated_at: string | null
        }
        Insert: {
          chat_id: number
          dados_temp?: Json | null
          step?: string | null
          updated_at?: string | null
        }
        Update: {
          chat_id?: number
          dados_temp?: Json | null
          step?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bot_sessions: {
        Row: {
          chat_id: number
          data_envio: string | null
          data_retorno: string | null
          id_divida: string | null
          nome: string | null
          step: string | null
          updated_at: string | null
          valor: string | null
          valor_volta: number | null
        }
        Insert: {
          chat_id: number
          data_envio?: string | null
          data_retorno?: string | null
          id_divida?: string | null
          nome?: string | null
          step?: string | null
          updated_at?: string | null
          valor?: string | null
          valor_volta?: number | null
        }
        Update: {
          chat_id?: number
          data_envio?: string | null
          data_retorno?: string | null
          id_divida?: string | null
          nome?: string | null
          step?: string | null
          updated_at?: string | null
          valor?: string | null
          valor_volta?: number | null
        }
        Relationships: []
      }
      emprestimos_v30: {
        Row: {
          banco_origem: string | null
          chat_id: number | null
          data_inicio: string | null
          data_vencimento: string | null
          id: number
          nome: string
          qtd_renovacoes: number | null
          situacao: string | null
          valor_principal: number
          valor_total: number
        }
        Insert: {
          banco_origem?: string | null
          chat_id?: number | null
          data_inicio?: string | null
          data_vencimento?: string | null
          id?: number
          nome: string
          qtd_renovacoes?: number | null
          situacao?: string | null
          valor_principal: number
          valor_total: number
        }
        Update: {
          banco_origem?: string | null
          chat_id?: number | null
          data_inicio?: string | null
          data_vencimento?: string | null
          id?: number
          nome?: string
          qtd_renovacoes?: number | null
          situacao?: string | null
          valor_principal?: number
          valor_total?: number
        }
        Relationships: []
      }
      emprestimos_v30_backup_20260321: {
        Row: {
          banco_origem: string | null
          chat_id: number | null
          data_inicio: string | null
          data_vencimento: string | null
          id: number | null
          nome: string | null
          qtd_renovacoes: number | null
          situacao: string | null
          valor_principal: number | null
          valor_total: number | null
        }
        Insert: {
          banco_origem?: string | null
          chat_id?: number | null
          data_inicio?: string | null
          data_vencimento?: string | null
          id?: number | null
          nome?: string | null
          qtd_renovacoes?: number | null
          situacao?: string | null
          valor_principal?: number | null
          valor_total?: number | null
        }
        Update: {
          banco_origem?: string | null
          chat_id?: number | null
          data_inicio?: string | null
          data_vencimento?: string | null
          id?: number | null
          nome?: string | null
          qtd_renovacoes?: number | null
          situacao?: string | null
          valor_principal?: number | null
          valor_total?: number | null
        }
        Relationships: []
      }
      fluxo_caixa_v30: {
        Row: {
          data_movimento: string | null
          descricao: string | null
          destino: string | null
          id: number
          id_emprestimo: number | null
          observacao: string | null
          origem_caixa: string | null
          tipo: string | null
          valor: number | null
        }
        Insert: {
          data_movimento?: string | null
          descricao?: string | null
          destino?: string | null
          id?: number
          id_emprestimo?: number | null
          observacao?: string | null
          origem_caixa?: string | null
          tipo?: string | null
          valor?: number | null
        }
        Update: {
          data_movimento?: string | null
          descricao?: string | null
          destino?: string | null
          id?: number
          id_emprestimo?: number | null
          observacao?: string | null
          origem_caixa?: string | null
          tipo?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_fluxo_id_emprestimo"
            columns: ["id_emprestimo"]
            isOneToOne: false
            referencedRelation: "emprestimos_v30"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_fluxo_id_emprestimo"
            columns: ["id_emprestimo"]
            isOneToOne: false
            referencedRelation: "vw_auditoria_emprestimos_v30"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_fluxo_id_emprestimo"
            columns: ["id_emprestimo"]
            isOneToOne: false
            referencedRelation: "vw_emprestimos_relatorio_v30"
            referencedColumns: ["id"]
          },
        ]
      }
      fluxo_caixa_v30_backup_20260321: {
        Row: {
          data_movimento: string | null
          descricao: string | null
          destino: string | null
          id: number | null
          id_emprestimo: number | null
          tipo: string | null
          valor: number | null
        }
        Insert: {
          data_movimento?: string | null
          descricao?: string | null
          destino?: string | null
          id?: number | null
          id_emprestimo?: number | null
          tipo?: string | null
          valor?: number | null
        }
        Update: {
          data_movimento?: string | null
          descricao?: string | null
          destino?: string | null
          id?: number | null
          id_emprestimo?: number | null
          tipo?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      historico_emprestimos: {
        Row: {
          banco: string | null
          data_envio: string | null
          data_retorno: string | null
          destino_lucro: string | null
          id: number
          juros: string | null
          nome: string | null
          situacao: string | null
          valor_emprestado: string | null
          valor_volta: number | null
        }
        Insert: {
          banco?: string | null
          data_envio?: string | null
          data_retorno?: string | null
          destino_lucro?: string | null
          id?: number
          juros?: string | null
          nome?: string | null
          situacao?: string | null
          valor_emprestado?: string | null
          valor_volta?: number | null
        }
        Update: {
          banco?: string | null
          data_envio?: string | null
          data_retorno?: string | null
          destino_lucro?: string | null
          id?: number
          juros?: string | null
          nome?: string | null
          situacao?: string | null
          valor_emprestado?: string | null
          valor_volta?: number | null
        }
        Relationships: []
      }
      historico_salarios: {
        Row: {
          data_pagamento: string | null
          id: number
          mes: string | null
          valor_pra_cada: string | null
        }
        Insert: {
          data_pagamento?: string | null
          id?: number
          mes?: string | null
          valor_pra_cada?: string | null
        }
        Update: {
          data_pagamento?: string | null
          id?: number
          mes?: string | null
          valor_pra_cada?: string | null
        }
        Relationships: []
      }
      livro_caixa: {
        Row: {
          cliente_nome: string
          data_pagamento: string
          id: number
          id_contrato: number | null
          observacao: string | null
          tipo_operacao: string
          valor_pago: number
        }
        Insert: {
          cliente_nome: string
          data_pagamento?: string
          id?: number
          id_contrato?: number | null
          observacao?: string | null
          tipo_operacao: string
          valor_pago: number
        }
        Update: {
          cliente_nome?: string
          data_pagamento?: string
          id?: number
          id_contrato?: number | null
          observacao?: string | null
          tipo_operacao?: string
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "livro_caixa_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "historico_emprestimos"
            referencedColumns: ["id"]
          },
        ]
      }
      transacoes_nubank: {
        Row: {
          cliente: string | null
          data: string | null
          descricao: string | null
          id: number
          mes: string | null
          saldo: string | null
          tipo: string | null
          valor: string | null
        }
        Insert: {
          cliente?: string | null
          data?: string | null
          descricao?: string | null
          id?: number
          mes?: string | null
          saldo?: string | null
          tipo?: string | null
          valor?: string | null
        }
        Update: {
          cliente?: string | null
          data?: string | null
          descricao?: string | null
          id?: number
          mes?: string | null
          saldo?: string | null
          tipo?: string | null
          valor?: string | null
        }
        Relationships: []
      }
      transacoes_socios: {
        Row: {
          cliente: string | null
          data: string | null
          descricao: string | null
          id: number
          mes: string | null
          saldo: string | null
          tipo: string | null
          valor: string | null
        }
        Insert: {
          cliente?: string | null
          data?: string | null
          descricao?: string | null
          id?: number
          mes?: string | null
          saldo?: string | null
          tipo?: string | null
          valor?: string | null
        }
        Update: {
          cliente?: string | null
          data?: string | null
          descricao?: string | null
          id?: number
          mes?: string | null
          saldo?: string | null
          tipo?: string | null
          valor?: string | null
        }
        Relationships: []
      }
      usuarios_config: {
        Row: {
          chat_id: number
          created_at: string
          hora_relatorio: number | null
          id: number
          nome: string | null
        }
        Insert: {
          chat_id: number
          created_at?: string
          hora_relatorio?: number | null
          id?: number
          nome?: string | null
        }
        Update: {
          chat_id?: number
          created_at?: string
          hora_relatorio?: number | null
          id?: number
          nome?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      vw_auditoria_emprestimos_v30: {
        Row: {
          erro: string | null
          id: number | null
          nome: string | null
          situacao: string | null
          valor_principal: number | null
          valor_total: number | null
        }
        Insert: {
          erro?: never
          id?: number | null
          nome?: string | null
          situacao?: string | null
          valor_principal?: number | null
          valor_total?: number | null
        }
        Update: {
          erro?: never
          id?: number | null
          nome?: string | null
          situacao?: string | null
          valor_principal?: number | null
          valor_total?: number | null
        }
        Relationships: []
      }
      vw_emprestimos_relatorio_v30: {
        Row: {
          banco_origem: string | null
          data_inicio: string | null
          data_vencimento: string | null
          id: number | null
          juros_recebidos: number | null
          nome: string | null
          pago_juros: number | null
          pago_principal: number | null
          qtd_renovacoes: number | null
          saldo_principal: number | null
          saldo_total: number | null
          situacao: string | null
          ultimo_movimento: string | null
          valor_principal: number | null
          valor_total: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
