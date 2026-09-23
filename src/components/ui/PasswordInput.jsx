import { useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import "./PasswordInput.css";

export default function PasswordInput({ value, onChange, placeholder, required, minLength, name }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input">
      <input
        type={visible ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        className="password-input__toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        tabIndex={-1}
      >
        {visible ? <IconEyeOff size={17} stroke={1.6} /> : <IconEye size={17} stroke={1.6} />}
      </button>
    </div>
  );
}