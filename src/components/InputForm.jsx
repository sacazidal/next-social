const InputForm = ({ title, type, value, onChange, placeholder }) => {
  return (
    <div className="w-full">
      <label className="ml-3 block text-base font-medium text-gray-300">
        {title}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full border-gray-800 rounded-md focus:outline-none focus:border-gray-400 px-3 py-2"
        placeholder={placeholder}
      />
    </div>
  );
};
export default InputForm;
