/**
 * Open UX Harness — Validador de Envelope de Handoff Padronizado
 * Valida a conformidade de objetos de handoff em relação à interface HandoffEnvelope.
 */

export interface HandoffEnvelope {
  from: string;
  to: string;
  phase: string;
  taskId: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  timestamp: string;
  context: {
    currentState: string;
    relevantFiles: string[];
    dependencies?: string[];
    constraints?: string[];
  };
  deliverableRequest: {
    description: string;
    acceptanceCriteria: string[];
    referenceMaterials?: string[];
  };
  qualityExpectations: {
    mustPass: string[];
    evidenceRequired: string[];
    handoffToNext?: string;
  };
}

const VALID_PRIORITIES: readonly string[] = ['Critical', 'High', 'Medium', 'Low'];

/**
 * Valida se um objeto qualquer atende estritamente à interface HandoffEnvelope.
 *
 * @param json Objeto desconhecido a ser validado
 * @returns Objeto com status valid (boolean) e lista de mensagens de erro (errors)
 */
export function validateHandoffEnvelope(json: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return {
      valid: false,
      errors: ['O envelope de handoff deve ser um objeto JSON válido.'],
    };
  }

  const envelope = json as Record<string, unknown>;

  // 1. Validação de Metadados
  if (typeof envelope.from !== 'string' || envelope.from.trim().length === 0) {
    errors.push('Campo "from" é obrigatório e deve ser uma string não vazia.');
  }

  if (typeof envelope.to !== 'string' || envelope.to.trim().length === 0) {
    errors.push('Campo "to" é obrigatório e deve ser uma string não vazia.');
  }

  if (typeof envelope.phase !== 'string' || envelope.phase.trim().length === 0) {
    errors.push('Campo "phase" é obrigatório e deve ser uma string não vazia.');
  }

  if (typeof envelope.taskId !== 'string' || envelope.taskId.trim().length === 0) {
    errors.push('Campo "taskId" é obrigatório e deve ser uma string não vazia.');
  }

  if (typeof envelope.priority !== 'string' || !VALID_PRIORITIES.includes(envelope.priority)) {
    errors.push('Campo "priority" deve ser um dos valores permitidos: Critical, High, Medium, Low.');
  }

  if (
    typeof envelope.timestamp !== 'string' ||
    envelope.timestamp.trim().length === 0 ||
    isNaN(Date.parse(envelope.timestamp))
  ) {
    errors.push('Campo "timestamp" deve ser uma string no formato ISO válido.');
  }

  // 2. Validação do Contexto
  if (!envelope.context || typeof envelope.context !== 'object' || Array.isArray(envelope.context)) {
    errors.push('Campo "context" é obrigatório e deve ser um objeto.');
  } else {
    const ctx = envelope.context as Record<string, unknown>;

    if (typeof ctx.currentState !== 'string' || ctx.currentState.trim().length === 0) {
      errors.push('Campo "context.currentState" é obrigatório e deve ser uma string não vazia.');
    }

    if (
      !Array.isArray(ctx.relevantFiles) ||
      ctx.relevantFiles.length === 0 ||
      !ctx.relevantFiles.every((file) => typeof file === 'string' && file.trim().length > 0)
    ) {
      errors.push('Campo "context.relevantFiles" deve ser um array com pelo menos 1 arquivo relevante.');
    }

    if (
      ctx.dependencies !== undefined &&
      (!Array.isArray(ctx.dependencies) ||
        !ctx.dependencies.every((dep) => typeof dep === 'string'))
    ) {
      errors.push('Campo "context.dependencies" deve ser um array de strings quando fornecido.');
    }

    if (
      ctx.constraints !== undefined &&
      (!Array.isArray(ctx.constraints) ||
        !ctx.constraints.every((con) => typeof con === 'string'))
    ) {
      errors.push('Campo "context.constraints" deve ser um array de strings quando fornecido.');
    }
  }

  // 3. Validação do Pedido de Entregável
  if (
    !envelope.deliverableRequest ||
    typeof envelope.deliverableRequest !== 'object' ||
    Array.isArray(envelope.deliverableRequest)
  ) {
    errors.push('Campo "deliverableRequest" é obrigatório e deve ser um objeto.');
  } else {
    const delReq = envelope.deliverableRequest as Record<string, unknown>;

    if (typeof delReq.description !== 'string' || delReq.description.trim().length === 0) {
      errors.push('Campo "deliverableRequest.description" é obrigatório e deve ser uma string não vazia.');
    }

    if (
      !Array.isArray(delReq.acceptanceCriteria) ||
      delReq.acceptanceCriteria.length === 0 ||
      !delReq.acceptanceCriteria.every((crit) => typeof crit === 'string' && crit.trim().length > 0)
    ) {
      errors.push(
        'Campo "deliverableRequest.acceptanceCriteria" deve ser um array com pelo menos 1 critério de aceite.'
      );
    }

    if (
      delReq.referenceMaterials !== undefined &&
      (!Array.isArray(delReq.referenceMaterials) ||
        !delReq.referenceMaterials.every((ref) => typeof ref === 'string'))
    ) {
      errors.push(
        'Campo "deliverableRequest.referenceMaterials" deve ser um array de strings quando fornecido.'
      );
    }
  }

  // 4. Validação das Expectativas de Qualidade
  if (
    !envelope.qualityExpectations ||
    typeof envelope.qualityExpectations !== 'object' ||
    Array.isArray(envelope.qualityExpectations)
  ) {
    errors.push('Campo "qualityExpectations" é obrigatório e deve ser um objeto.');
  } else {
    const qe = envelope.qualityExpectations as Record<string, unknown>;

    if (
      !Array.isArray(qe.mustPass) ||
      qe.mustPass.length === 0 ||
      !qe.mustPass.every((item) => typeof item === 'string' && item.trim().length > 0)
    ) {
      errors.push(
        'Campo "qualityExpectations.mustPass" deve ser um array não vazio de critérios mandatórios.'
      );
    }

    if (
      !Array.isArray(qe.evidenceRequired) ||
      qe.evidenceRequired.length === 0 ||
      !qe.evidenceRequired.every((item) => typeof item === 'string' && item.trim().length > 0)
    ) {
      errors.push(
        'Campo "qualityExpectations.evidenceRequired" deve ser um array não vazio de evidências exigidas.'
      );
    }

    if (
      qe.handoffToNext !== undefined &&
      (typeof qe.handoffToNext !== 'string' || qe.handoffToNext.trim().length === 0)
    ) {
      errors.push(
        'Campo "qualityExpectations.handoffToNext" deve ser uma string não vazia quando fornecido.'
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
