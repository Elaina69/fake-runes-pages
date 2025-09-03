const CONSOLE_STYLE = {
    prefix: '%c Elaina - Fake runes pages ',
    css: 'color: #ffffff; background-color: #f77fbe'
};

export const log = (message: any, ...args: any[]) => console.log(CONSOLE_STYLE.prefix + '%c ' + message, CONSOLE_STYLE.css, '', ...args);
export const warn = (message: any, ...args: any[]) => console.warn(CONSOLE_STYLE.prefix + '%c ' + message, CONSOLE_STYLE.css, '', ...args);
export const error = (message: any, ...args: any[]) => console.error(CONSOLE_STYLE.prefix + '%c ' + message, CONSOLE_STYLE.css, '', ...args);