export default function BookingStepper({ status }) {
  const steps = ["pending", "accepted", "completed"];

  return (
    <div className="stepper">
      {steps.map((step, i) => (
        <div
          key={i}
          className={`step ${steps.indexOf(status) >= i ? "active" : ""}`}
        >
          {step}
        </div>
      ))}
    </div>
  );
}