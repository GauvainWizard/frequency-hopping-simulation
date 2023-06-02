let RNTable: number[] = [
  48, 98, 63, 1, 36, 95, 78, 102, 94, 73, 0, 64, 25, 81, 76, 59, 124, 23, 104,
  100, 101, 47, 118, 85, 18, 56, 96, 86, 54, 2, 80, 34, 127, 13, 6, 89, 57, 103,
  12, 74, 55, 111, 75, 38, 109, 71, 112, 29, 11, 88, 87, 19, 3, 68, 110, 26, 33,
  31, 8, 45, 82, 58, 40, 107, 32, 5, 106, 92, 62, 67, 77, 108, 122, 37, 60, 66,
  121, 42, 51, 126, 117, 114, 4, 90, 43, 52, 53, 113, 120, 72, 16, 49, 7, 79,
  119, 61, 22, 84, 9, 97, 91, 15, 21, 24, 46, 39, 93, 105, 65, 70, 125, 99, 17,
  123,
]; // RN Table, given in the 3GPP TS 45.002 V17.0.0 (2022-03)

/**
 * @class TRX
 * @description A class that represents a TRX
 */
export class TRX {
  private frequency: number;
  private communication_duration: number;
  private communication_duration_total: number;
  private readonly maio: number;
  private hsn: number;
  private mai_number: number;

  constructor(maio: number, hsn: number = 0, mai_number: number = 8) {
    this.maio = maio;
    this.hsn = hsn;
    this.mai_number = mai_number;
    this.frequency = 0;
    this.communication_duration = 0;
    this.communication_duration_total = 0;
    this.hop(0); // Initialize the frequency of the TRX to the first frame
  }

  /**
   * Initialize the TRX with the given parameters
   * @param hsn The HSN of the TRX
   * @param mai_number The MAI number of the TRX
   */
  public init(mai_number: number, hsn: number) {
    this.mai_number = mai_number;
    this.hsn = hsn;
    this.communication_duration = 0;
    this.communication_duration_total = 0;
  }

  /**
   * Change the frequency of the TRX
   * Hopping algorithm, according to the 3GPP TS 45.002 V17.0.0 (2022-03)
   * @param frame The current frame number
   */
  public hop(frame) {
    // If the HSN is 0, the frequency changes cyclically
    if (this.hsn === 0) this.frequency = (this.maio + frame) % this.mai_number;
    // If the HSN is not 0, the frequency changes according to the hopping algorithm
    else {
      const t1r = (frame / (26 * 51)) % 64;
      const t2 = frame % 26;
      const t3 = frame % 51;
      const m = t2 + RNTable[(this.hsn ^ t1r) + t3];
      const m_dash = m % 2 ** this.get_nbin();
      const t_dash = t3 % 2 ** this.get_nbin();

      let s: number;
      if (m_dash < this.mai_number) s = m_dash;
      else s = (m_dash + t_dash) % this.mai_number;

      this.frequency = (this.maio + s) % this.mai_number;
    }
    // If the TRX is communicating, decrease the communication duration
    if (this.communication_duration > 0) this.communication_duration--;
    // If the communication duration is 0, reset the total communication duration
    if (this.communication_duration === 0)
      this.communication_duration_total = 0;
  }

  /**
   * Get the number of bits required to represent the MAI number
   * @returns The number of bits required to represent the MAI number
   */
  private get_nbin(): number {
    return Math.floor(Math.log2(this.mai_number) + 1);
  }

  /**
   * Get the frequency of the TRX
   * @returns The frequency of the TRX
   */
  public get_frequency() {
    return this.frequency;
  }

  /**
   * Check if the TRX is available
   * @returns True if the TRX is available, false otherwise
   */
  public is_available() {
    return this.communication_duration === 0;
  }

  /**
   * Check if it is the first slot of the communication in the TRX
   * @returns True if it is the first slot of the communication in the TRX, false otherwise
   */
  public is_first_slot() {
    return this.communication_duration_total === this.communication_duration;
  }

  /**
   * Check if is the last slot of the communication in the TRX
   * @returns True if is the last slot of the communication in the TRX, false otherwise
   */
  public is_last_slot() {
    return this.communication_duration === 1;
  }

  /**
   * Communicate for a given duration
   * @param duration The duration of the communication
   */
  public communicate(duration: number) {
    this.communication_duration = duration;
    this.communication_duration_total = duration;
  }
}
