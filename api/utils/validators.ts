export const isValidEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPassword = (password: string) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

export const passwordsMatch = (password: string, confirmPassword: string) => {
  return password === confirmPassword;
};

export const isValidAge = (age: number) => {
  return Number.isInteger(age) && age >= 13;
};
