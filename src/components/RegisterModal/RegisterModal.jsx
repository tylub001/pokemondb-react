import { useEffect } from "react";
import ModalWithForm from "../ModalWithForm/ModalWithForm";


export default function RegisterModal({
 isOpen,
  onClose,
  onRegister,
  onLoginClick,
  isValid,
  validateUserInput,
  values,
  setValues,
  errors,
  setErrors,

}) {
  useEffect(() => {
  if (isOpen) {
    setErrors({});
  }
}, [isOpen]);

  const handleChange = (e) => {
  const { name, value } = e.target;
  setValues((prev) => ({ ...prev, [name]: value }));
  let errorMessage = "";
if (name === "email" && !value.includes("@")) {
  errorMessage = "Please enter a valid email.";
} else if (name === "password" && value.length < 2) {
  errorMessage = "Password must be at least 2 characters.";
} else if (name === "name" && value.trim().length === 0) {
  errorMessage = "Name cannot be empty.";
}

setErrors((prev) => ({ ...prev, [name]: errorMessage }));
};

const handleSubmit = (e) => {
  e.preventDefault();

  if (!values.email || !values.password || !values.name) {
    alert("Please fill out all fields.");
    return;
  }

  onRegister({
    name: values.name.trim(),
    email: values.email.trim(),
    password: values.password,
  });

  onClose();
};

useEffect(() => {
  validateUserInput(values);
}, [values]);

  return (
    <ModalWithForm
      title="Sign Up"
      buttonText="Sign up"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      extraAction={
        <button type="button" className="modal__link" onClick={onLoginClick}>
          or Log in
        </button>
      }
      isValid={isValid}
    >
      <label className="modal__label">
        Email*
        <input
          type="email"
          name="email"
          className="modal__input"
          placeholder="Email"
          required
          value={values.email}
          onChange={handleChange}
        />
        <span className="modal__error">{errors.email}</span>
      </label>
      <label className="modal__label">
        Password*
        <input
          type="password"
          name="password"
          className="modal__input"
          placeholder="Password"
          required
          minLength={2}
          value={values.password}
          onChange={handleChange}
        />
        <span className="modal__error">{errors.password}</span>
      </label>
      <label className="modal__label">
        Name
        <input
          type="text"
          name="name"
          className="modal__input"
          placeholder="Username"
          value={values.name}
          onChange={handleChange}
        />
        <span className="modal__error">{errors.name}</span>
      </label>
    </ModalWithForm>
  );
}
