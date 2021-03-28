# Minimal PO loader for `ngx-translate`

This repository provides a minimal translation loader for `ngx-translate` using PO files as source.

In order to use it, create a factory function for the `PoHTTPLoader` class:

```
function createTranslateLoader(http: HttpClient): PoHTTPLoader {
    return new PoHTTPLoader(http, 'prefix', '.po');
}
```

Then, import the `TranslateModule` (in your project's module) like this:

```
imports: [
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient]
        }
    })
]
```