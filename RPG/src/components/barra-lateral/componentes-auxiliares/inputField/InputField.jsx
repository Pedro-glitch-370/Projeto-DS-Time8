export const InputField = ({ label, type = "text", value, onChange, placeholder, isTextarea = false, rows = 4 }) => {
  const InputComponent = isTextarea ? "textarea" : "input";
  
  return (
    <div className="input-group">
      <label>{label}:</label>
      <InputComponent
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input ${isTextarea ? 'textarea' : ''}`}
        rows={isTextarea ? rows : undefined}
      />
    </div>
  );
};