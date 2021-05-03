import {TranslateLoader} from '@ngx-translate/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';

export class PoHTTPLoader implements TranslateLoader {
    constructor(protected _http: HttpClient, protected _prefix: string = 'i18n',
                protected _suffix: string = '.po') {}

    getTranslation(lang: string): Observable<any> {
        return this._http.get(`${this._prefix}/${lang}${this._suffix}`, {
            responseType: 'text'
        }).pipe(
            map((contents: string) => this.parse(contents))
        );
    }

    public parse(contents: string): any {
        const translations: { [key: string]: string } = {};

        let key = '';
        let translation = '';

        const lines = contents.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Ignore comments and blank lines
            if (line.indexOf('#') === 0 || line === '') {
                continue;
            }

            if (line.indexOf('msgid') !== -1) {
                const begin = line.indexOf('"');
                const end = line.lastIndexOf('"');

                if (end - begin > 1) {
                    key = line.substring(begin + 1, end);
                    translation = '';
                } else {
                    // Multi line ID
                    let stop = false;
                    let j = i + 1;
                    key = '';
                    while (!stop) {
                        if (lines[j] !== '' && lines[j].indexOf('msgstr') === -1 && lines[j].indexOf('#') !== 0) {
                            key += lines[j].substr(1, lines[j].length - 2);
                            j++;
                        } else {
                            stop = true;
                        }
                    }

                    i = j - 1;
                }
            } else if (line.indexOf('msgstr') !== -1) {
                const begin = line.indexOf('"');
                const end = line.lastIndexOf('"');

                if (end - begin > 1) {
                    translation = line.substring(begin + 1, end);
                } else {
                    // Multi line ID
                    let stop = false;
                    let j = i + 1;
                    translation = '';
                    while (!stop) {
                        if (lines[j] !== '' && lines[j].indexOf('msgid') === -1 && lines[j].indexOf('#') === -1) {
                            translation += lines[j].substr(1, lines[j].length - 2);
                        } else {
                            stop = true;
                        }

                        j++;
                    }

                    i = j - 1;
                }
            }

            if (key.length > 0 && translation.length > 0) {
                translations[this.processString(key)] = this.processString(translation);
                key = '';
                translation = '';
            }
        }

        return translations;
    }

    private processString(text: string): string {
        return text.replace(/\\"/iug, '"');
    }
}