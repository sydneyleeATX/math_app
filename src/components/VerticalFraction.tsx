import React from 'react';
import { type FractionType } from '../types';

interface VerticalFractionProps {
  fraction: FractionType;
}

const VerticalFraction: React.FC<VerticalFractionProps> = ({ fraction }) => {
  // If denominator is 1, display as a whole number.
  // Assumes fraction is already simplified (e.g. 2/2 should be passed as {numerator: 1, denominator: 1})
  if (fraction.denominator === 1) {
    return <>{fraction.numerator}</>;
  }

  return (
    <span 
      className="inline-flex flex-col items-center align-middle mx-1" 
      style={{ 
        verticalAlign: '-0.33em', // Adjust this value to fine-tune vertical alignment with surrounding text
        lineHeight: '1' // Ensures compact height for the container
      }}
    >
      <span className="numerator block text-sm leading-none">{fraction.numerator}</span>
      <span className="fraction-line block border-t border-current w-full my-0.5"></span> {/* my-0.5 for 0.125rem top/bottom margin */}
      <span className="denominator block text-sm leading-none">{fraction.denominator}</span>
    </span>
  );
};
export default VerticalFraction;
