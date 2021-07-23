const unit = 8;

const selfTheme = {
  spacing: (multiple: number) => (multiple * unit).toString() + 'px',
  fontFamily: 'Roboto Variable',
  color: {
    primary: '#3182ce',
    secondary: '#3182ce63',
    white: '#FFFFFF',
    darkText: '#091F43',
    grey90: '#545E6F',
    grey80: '#657287',
    grey70: '#738198',
    grey60: '#8894A8',
    grey50: '#A4AEBD',
    grey40: '#B9C1CE',
    grey30: '#D4DAE2',
    grey20: '#EEF0F5',
    grey10: '#F8F9FB',
    blue: '#0068FF',
    red: 'red',
    dark: 'rgb(20, 20, 20)',
    light: '#FFFFFF',
  },
  text: {
    small: { size: '14px', lineHeight: '1.71' },
    regular: { size: '16px', lineHeight: '1.50' },
    medium: { size: '18px', lineHeight: '1.56' },
    large: { size: '20px', lineHeight: '1.60' },
    xlarge: { size: '32px', lineHeight: '1.80' },
  },
  borderRadii: {
    standard: '4px',
    curvy: '8px',
    circle: '50%',
  },
  get buttonSizes() {
    return {
      small: { height: this.spacing(4), padding: this.spacing(2) },
      medium: { height: this.spacing(5), padding: this.spacing(3) },
      large: { height: this.spacing(6), padding: this.spacing(4) },
    };
  },
  get border() {
    return ('1px solid ' + this.color.grey30);
  },
};

export { selfTheme };
