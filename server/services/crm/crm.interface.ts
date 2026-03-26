export interface LeadPayload {
  lead: {
    name: string;
    email: string;
    phone: string;
    [key: string]: any;
  };
  context: {
    projectSlug: string;
    unitIdentifier: string;
    price?: number | string;
  };
}

// Contrato estricto: El backend no debe saber nunca qué CRM se usa por debajo.
export interface CRMService {
  sendLead(payload: LeadPayload): Promise<boolean>;
}
