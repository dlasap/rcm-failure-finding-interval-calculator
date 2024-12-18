export function calculateFailureProbability(failureRate: number, inspectionInterval: number): number {
  return 1 - Math.exp(-failureRate * inspectionInterval)
}

export function calculateOptimalInterval(inspectionCost: number, failureCost: number, failureRate: number): number {
  return Math.sqrt(2 * inspectionCost / (failureCost * failureRate * failureRate))
}

export function calculateReliability(failureRate: number, inspectionInterval: number): number {
  return Math.exp(-failureRate * inspectionInterval)
}

export function calculateVoidingTime(
  tankVolume: number,
  pipeLength: number,
  pipeDiameter: number,
  systemType: 'gravity' | 'pressurized',
  pressureDifference?: number
): number {
  const gravity = 9.81 // m/s^2
  const pipeRadius = pipeDiameter / 2000 // convert mm to m
  const pipeArea = Math.PI * pipeRadius * pipeRadius
  
  if (systemType === 'gravity') {
    // Use Torricelli's law for gravity systems
    const exitVelocity = Math.sqrt(2 * gravity * pipeLength)
    return tankVolume / (pipeArea * exitVelocity)
  } else {
    // Use Bernoulli's equation for pressurized systems
    if (pressureDifference === undefined) {
      throw new Error("Pressure difference is required for pressurized systems")
    }
    const density = 1000 // kg/m^3 (assuming water)
    const exitVelocity = Math.sqrt((2 * pressureDifference) / density)
    return tankVolume / (pipeArea * exitVelocity)
  }
}

export function calculateFailureRateFromMTBF(mtbf: number): number {
  return 1 / mtbf
}

export function calculateMTBFFromFailureRate(failureRate: number): number {
  return 1 / failureRate
}

export function convertMTBF(mtbf: number, fromUnit: string, toUnit: string): number {
  const hourConversion: { [key: string]: number } = {
    'hours': 1,
    'days': 24,
    'weeks': 168,
    'months': 730,
    'years': 8760
  };

  const mtbfInHours = mtbf * hourConversion[fromUnit];
  return mtbfInHours / hourConversion[toUnit];
}

