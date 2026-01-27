const Button = ({
  label = "Button",
  onClick,
  bgColor = "#FFC107",
  textColor = "#000000",
  padding = "px-6 py-3",
  rounded = "rounded-lg",
  fontSize = "text-base",
  fontWeight = "font-medium",
  marginTop = "mt-0",  
  disabled = false,
  className = "",
  type = "button",
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${marginTop}
        ${padding}
        ${rounded}
        ${fontSize}
        ${fontWeight}
        transition-all duration-200
        hover:opacity-90
        active:scale-[0.97]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {label}
    </button>
  );
};

export default Button;
