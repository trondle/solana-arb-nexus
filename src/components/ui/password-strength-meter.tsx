
import { Progress } from './progress';
import { validatePassword, getPasswordStrengthText, getPasswordStrengthColor } from '@/utils/passwordSecurity';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

const PasswordStrengthMeter = ({ password, className = '' }: PasswordStrengthMeterProps) => {
  const strength = validatePassword(password);
  const strengthText = getPasswordStrengthText(strength.score);
  const strengthColor = getPasswordStrengthColor(strength.score);

  if (!password) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Password Strength:</span>
        <span className={`text-sm font-medium ${strengthColor}`}>
          {strengthText}
        </span>
      </div>
      
      <Progress 
        value={(strength.score / 4) * 100} 
        className="h-2"
      />
      
      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((feedback, index) => (
            <p key={index} className="text-xs text-red-500">
              • {feedback}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
