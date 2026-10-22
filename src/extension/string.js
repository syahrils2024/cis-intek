String.prototype.toCapitalCase = function () {
  if (!this) return '';
  /** @type {Array<string>} */
  const split = this.split('');
  const [first] = split;
  split.shift();
  split.unshift(first.toLocaleUpperCase());
  return split.join('');
};

String.prototype.toDate = function () {
  return new Date(this);
};

String.prototype.toNumber = function () {
  const numbersOnly = this.replace(/\D/g, ''); // Remove all non-digit characters
  const parsedNumber = parseInt(numbersOnly); // Parse the string as an integer
  return Number.isNaN(parsedNumber) ? 0 : parsedNumber;
};

String.prototype.toDouble = function () {
  const pattern = /(\d+)(\.\d+)?/; // Pattern to match numbers with optional decimal part
  const numbersOnly = this.replace(pattern, ''); // Remove all non-digit characters
  const parsedNumber = parseFloat(numbersOnly); // Parse the string as a float
  return Number.isNaN(parsedNumber) ? 0 : parsedNumber;
};

String.prototype.toDoubleString = function () {
  const pattern = /(\d+)(\.\d+)?/; // Pattern to match numbers with optional decimal part
  const numbersOnly = this.replace(pattern, ''); // Remove all non-digit characters
  const parsedNumber = parseFloat(numbersOnly); // Parse the string as a float
  return Number.isNaN(parsedNumber) ? 0 : parsedNumber.toFixed(2);
};

String.prototype.formatNumber = function () {
  const numbersOnly = this.replace(/\D/g, ''); // Remove all non-digit characters
  return numbersOnly;
};

String.prototype.toDate = function () {
  return new Date(this);
};

String.prototype.nullIfEmpty = function () {
  return this.trim() === '' ? null : this;
};

String.prototype.addPadStart = function(length, char){
  const val = this
  return val.padStart(length, char);
}
