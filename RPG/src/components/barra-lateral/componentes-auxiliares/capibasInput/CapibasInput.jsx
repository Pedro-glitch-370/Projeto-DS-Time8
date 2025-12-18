export const CapibasInput = ({ value, onChange }) => {
  const handleChange = (e) => {
    // Permite apenas números e substitui o zero quando começar a digitar
    const inputValue = e.target.value.replace(/[^0-9]/g, '');
    
    if (inputValue === '' || inputValue === '0') {
      onChange('');
    } else {
      onChange(inputValue.replace(/^0+/, '')); // Remove zeros à esquerda
    }
  };

  const handleFocus = (e) => {
    // Se o valor for "0", limpa o campo ao focar
    if (e.target.value === '0') {
      onChange('');
    }
  };

  const handleBlur = (e) => {
    // Se o campo estiver vazio, coloca 0
    if (e.target.value === '') {
      onChange('0');
    }
  };

  return (
    <div className="input-group">
      <label>Quantidade de Capibas (Recompensa):</label>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Digite a quantidade de Capibas"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="input"
      />
    </div>
  );
};