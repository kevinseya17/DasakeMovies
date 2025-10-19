// valida formato de correo electrónico (básico RFC 5322)
export const isValidEmail = (email: string): boolean => {
  // evita espacios y asegura estructura usuario@dominio.tld
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

// valida contraseñas seguras y permite acentos y ñ
export const isValidPassword = (password: string): boolean => {
  /*
    requisitos:
    - mínimo 8 caracteres
    - al menos una letra minúscula (puede ser ñ o con acento)
    - al menos una letra mayúscula (puede ser Ñ o con acento)
    - al menos un número
    - al menos un símbolo especial
    - permite letras acentuadas y ñ
  */
  const regex =
    /^(?=.*[a-záéíóúüñ])(?=.*[A-ZÁÉÍÓÚÜÑ])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-zÁÉÍÓÚÜÑñ\d@$!%*?&._-]{8,}$/;
  return regex.test(password);
};

// compara contraseña y confirmación
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

// valida que la edad sea un número entero y mínimo 13 años
export const isValidAge = (age: number): boolean => {
  return Number.isInteger(age) && age >= 13;
};

// valida nombre y apellidos (permite ñ, acentos y espacios)
export const isValidName = (name: string): boolean => {
  /*
    acepta:
    - letras mayúsculas o minúsculas
    - ñ y Ñ
    - vocales acentuadas (á, é, í, ó, ú, ü)
    - espacios
    ejemplo válido: "José María Ñuñez"
  */
  const regex = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]+$/;
  return regex.test(name.trim());
};

