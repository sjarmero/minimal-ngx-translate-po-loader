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

    private parse(contents: string): any {
        const translations: { [key: string]: string } = {};

        let key = '';
        let translation = '';
        for (const line of contents.split('\n')) {
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
                    key = '';
                }
            }

            if (line.indexOf('msgstr') !== -1) {
                const begin = line.indexOf('"');
                const end = line.lastIndexOf('"');

                translation = end - begin > 1 ? line.substring(begin + 1, end) : '';
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