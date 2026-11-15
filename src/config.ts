function required(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`)
  }
  return value
}

export const config = {
  web3formsKey: required('VITE_WEB3FORMS_KEY'),
} as const