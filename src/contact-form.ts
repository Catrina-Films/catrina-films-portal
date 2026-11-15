import { config } from './config.ts';

const fieldNames = ['nombre', 'correo', 'mensaje'] as const;
type FieldName = (typeof fieldNames)[number];

type Web3FormsSuccessResponse = {
  success: true;
};

type ContactField = {
  input: HTMLInputElement | HTMLTextAreaElement;
  error: HTMLElement;
};

/**
 * Finds a required element and verifies it has the expected DOM type.
 *
 * @param parent - The document or element to search within.
 * @param selector - Selector for the element.
 * @param elementType - Expected element constructor.
 * @returns The matching element.
 */
function getRequiredElement<T extends HTMLElement>(
  parent: ParentNode,
  selector: string,
  elementType: { new (): T }
): T {
  const element = parent.querySelector(selector);

  if (!(element instanceof elementType)) {
    throw new Error(`Expected ${selector} to exist and be a valid element.`);
  }

  return element;
}

/**
 * Resolves a field and its inline error element from the form markup.
 *
 * @param selector - Selector for the input or textarea.
 * @param elementType - Expected field element constructor.
 * @returns The field input and its error-message element.
 */
function getContactField<T extends HTMLInputElement | HTMLTextAreaElement>(
  selector: string,
  elementType: { new (): T }
): ContactField {
  const input = getRequiredElement(form, selector, elementType);
  const fieldGroup = input.parentElement;

  if (!fieldGroup) {
    throw new Error(`Expected ${selector} to have a field group.`);
  }

  return {
    input,
    error: getRequiredElement(fieldGroup, '.field-error', HTMLElement)
  };
}

const form = getRequiredElement(document, '#contact-form', HTMLFormElement);
const formStatus = getRequiredElement(form, '#form-status', HTMLParagraphElement);
const fields: Record<FieldName, ContactField> = {
  nombre: getContactField('#nombre', HTMLInputElement),
  correo: getContactField('#correo', HTMLInputElement),
  mensaje: getContactField('#mensaje', HTMLTextAreaElement)
};

/**
 * Shows or clears the inline error message for a field.
 *
 * @param fieldName - The field to update.
 * @param message - Error message to display, or an empty string to clear it.
 */
function setFieldError(fieldName: FieldName, message: string): void {
  const { input, error } = fields[fieldName];
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  error.textContent = message;
}

function setStatus(message: string, status: 'ok' | 'error'): void {
  formStatus.textContent = message;
  formStatus.dataset.status = status;
  formStatus.hidden = false;
}

/**
 * Checks whether a Web3Forms response indicates a successful submission.
 *
 * @param value - Parsed response data returned by Web3Forms.
 * @returns True when the response has a success value of true.
 */
function isWeb3FormsSuccessResponse(value: unknown): value is Web3FormsSuccessResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    value.success === true
  );
}

/**
 * Checks whether an email address matches the expected email format.
 *
 * @param email - Email address entered by the user.
 * @returns True if the email format is valid.
 */
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validates all required fields in the contact form and displays field errors.
 *
 * @returns True when all fields pass validation.
 */
function validateForm(): boolean {
  let isValid = true;

  if (!fields.nombre.input.value.trim()) {
    setFieldError('nombre', 'El nombre es obligatorio.');
    isValid = false;
  } else {
    setFieldError('nombre', '');
  }

  if (!fields.correo.input.value.trim()) {
    setFieldError('correo', 'El correo es obligatorio.');
    isValid = false;
  } else if (!validateEmail(fields.correo.input.value)) {
    setFieldError('correo', 'Ingresa un correo válido.');
    isValid = false;
  } else {
    setFieldError('correo', '');
  }

  if (!fields.mensaje.input.value.trim()) {
    setFieldError('mensaje', 'El mensaje es obligatorio.');
    isValid = false;
  } else {
    setFieldError('mensaje', '');
  }

  return isValid;
}

/**
 * Sends the validated contact form to Web3Forms and updates the form status.
 */
async function sendContactForm(): Promise<void> {
  const submitButton = getRequiredElement(form, '.submit-button', HTMLButtonElement);
  submitButton.disabled = true;

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        access_key: config.web3formsKey,
        name: fields.nombre.input.value.trim(),
        email: fields.correo.input.value.trim(),
        message: fields.mensaje.input.value.trim(),
        subject: 'Nuevo mensaje de contacto - Catrina Films'
      })
    });
    const result: unknown = await response.json();

    if (!response.ok || !isWeb3FormsSuccessResponse(result)) {
      console.error(`Web3Forms request failed with status ${response.status}.`);
      setStatus('No se pudo enviar tu mensaje. Inténtalo de nuevo más tarde.', 'error');
      return;
    }

    form.reset();
    fieldNames.forEach((fieldName) => setFieldError(fieldName, ''));
    setStatus('¡Gracias! Tu mensaje ha sido enviado. Nos pondremos en contacto contigo pronto.', 'ok');
  } catch (error) {
    console.error('Unable to send contact form with Web3Forms.', error);
    setStatus('No se pudo enviar tu mensaje. Inténtalo de nuevo más tarde.', 'error');
  } finally {
    submitButton.disabled = false;
  }
}

form.addEventListener('submit', (event: SubmitEvent) => {
  event.preventDefault();
  const honeypot = getRequiredElement(form, '#sitio-web', HTMLInputElement);

  if (honeypot.value.trim()) {
    setStatus(
      '¡Gracias! Tu mensaje ha sido enviado. Nos pondremos en contacto contigo pronto.',
      'ok'
    );
    return;
  }

  if (!validateForm()) {
    setStatus('Revisa los campos marcados e inténtalo de nuevo.', 'error');
    return;
  }

  void sendContactForm();
});
