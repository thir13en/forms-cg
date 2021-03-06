# Angular Universal

`Server Side Rendering` might be useful to deliver speed on first page load, optimize for `SEO`
and `Social Networks`. It consists ion `pre-rendering` a specific Angular App Route in the server,
send it to the client really fast and bootstrap the app from there.
Angular Universal runs on a `node` `express` server.  
Another reason for using `ssr` is `compatibility with social media crawlers`, for example to display
beautiful cards when people share our site in social networks.  
Universal runs the `Server-Side Rendering Layer` instead of the `Client-Side` one.  

By default, SPA's first render is a blank page, because they rely on the JavaScript bundles to be runt
in order to start rendering the page content.

### Example meta tags for twitter
```html
<meta content="summary" name="twitter:card">
<meta content="@TwitterName" name="twitter:site">
<meta name="twitter:title" content="name and punchline">
<meta name="twitter:description" content="site description">
<meta name="twitter:text:description" content="site description">
<meta name="twitter:image" content="https://img.url">
```

### Setup example (might be outdated)
```typescript
import { ng2engine } from 'angular2-universal'; 

let app = express();

// config view engine
app.engine('.html', ng2engine);
app.set('views', __dirname);
app.set('view engine', 'html');

// config the root route 
app.use('/', function(req, res) {
  let url = req.originalUrl || '/';
  res.render('index', {
    App,
    providers: [...],
    preboot: true
  });
});
```
The root component `App` contains route specific anotations:
```typescript
@RouteConfig([
  { path: '/home', component: Home, name: 'Home' },
  { path: '/about', component: About, name: 'About' },
  { path: '/', redirectTo: '/home', pathMatch: 'full' },
])
export class App {
   ...
}
```
The meaning of these annotations is clear on the client side: navigation will 
update the HTML5 Browser history instead of triggering a full page refresh, 
creating the enhanced experience that single page apps are all about.  
On the server, the router has a different configuration than on the client:  
```typescript
import { ng2engine, NODE_LOCATION_PROVIDERS } from 'angular2-universal';

  res.render('index', {
    App,
    providers: [
      ROUTER_PROVIDERS,
      NODE_LOCATION_PROVIDERS,
    ],
    preboot: true
  });
```

### Bootstrapping a Universal Application
It all starts by running the following command in your project:
```
ng add @nguniversal/express-engine
```
This will generate the files `src/main.server.ts`, `src/app/app.server.module.ts`,
`src/server.ts`, being those the boostrapper for the server app, the server side rendering
module and the `express` server.

### Start a Universal app
1. Make sure you have `BrowserModule` imported.
1. run the schematic `ng add @nguniversal/express-engine --clientProject`.
1. In the newly generated "server" `angular.json` key, change the field: `"outputPath": "dist-server"`.
1. create a new file in the root of your project named `prerender.ts`.
1. configure the `express` server or use `nguniversal` which already integrates it.

### the `ngExpressEngine`
A rendering Engine that `Angular Universal` provides for us to us within the `express`
framework. This might be old syntax:
```javascript
const express = require('express');
const app = express();
const distFolder = __dirname + '/dist';
enableProdMode();

app.engine('html', ngExpressEngine({
    bootstrap: AppServerModuleFactory,
    providers: [provideModuleApp(LAZY_MODULE_MAP)],
}));

app.set('view engine', 'html');
app.set('views', distFolder);

// static files with extension
app.get('*.*', express.static(distFolder, { maxAge: '1y', }));

app.get('*', (req, res) => {
    // the name of the file we want to render without the extension
    res.render('index', { req });
});

app.listen(3000, () => console.log('running...'));
```

### Application Shell
A skeleton that we use for sending an initial structural load of our app, without most of the
necessary information.
```angular2html
<ng-container *appShellNoRender>
    // whatever is inside here, won't be rendered at SSR time
</ng-container>
<ng-container *appShellRender>
    // whatever is inside here, will be rendered exclusively at SSR time
</ng-container>
```
Implementing the directives...
```typescript
@Directive({
    selector: [appShellNoRender],
})
export class ShellNoRender implements OnInit {

    constructor(
        private viewContainer: ViewContainerRef,
        private templateRef: TemplateRef<any>,
        @Inject(PLATFORM_ID) private platformId: any,
    ) {}

    ngOnInit(): void {
        if (isPlatformServer(platformId)) {
            this.viewContainer.clear();
        } else {
            this.viewContainer.createEmbeddedView(this.templateRef);
        }
    }

}
```
```typescript
@Directive({
    selector: [appShellRender],
})
export class ShellRender implements OnInit {

    constructor(
        private viewContainer: ViewContainerRef,
        private templateRef: TemplateRef<any>,
        @Inject(PLATFORM_ID) private platformId: any,
    ) {}

    ngOnInit(): void {
        if (isPlatformServer(platformId)) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }

}
```

### Angular Universal State Transfer API
Useful when we are server side rendering an SPA page, and we already have available
information that would normally be requested via an AJAX request. What can happen is 
that the server side rendering process already fetched this information and due to the
app initialization process on the client, this AJAX XHR request will trigger again.  
Here you are and example on how to use it for instance in a route resolver:
```typescript
@Injectable()
export class ElementResolver implements Resolver<Element> {
    constructor(
        private api: ApiService,
        @Inject(PLATFORM_ID) platformId: any,
        private transferState: TransferState,
    ) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Element> {
        const elementId = route.params.id;
        // define a transfer key
        const ELEMENT_KEY = makeStateKey<Element>(`element-${elementId}`);

        if (this.transferState.hasKey(ELEMENT_KEY)) {
            // the second parameter is a default value to use if the data for transfer is not present
            const element = this.transferState.get<Element>(ELEMENT_KEY, null);
            
            // now that we have the data, it is ok to remove it
            this.transferState.remove(ELEMENT_KEY);
            
            return observableOf(element);
        } else {
            // in case we don't have the data, we can set it via a side effect
            return this.api.get(ENDPOINTS.GET_ELEMENT).pipe(
                first(),
                tap(element => {
                    // we can only do this is we are on the universal side rendering cycle
                    if (isPlatformServer(this.platformId)) {
                        this.transferState.set(ELEMENT_KEY, element)
                    }
                }),
            );

        }

    }

}
```

### Deploy Universal App in Firebase
You can find an example on how to deploy [here](https://github.com/davideast/angular-universal-express-firebase).
```typescript
import * as functions from 'firebase-cloud-functions';
import * as angularUniversal from 'angular-universal-express-firebase';

export const ssrApp = angularUniversal.trigger({
  index: __dirname + './index-universal.html',
  main: __dirname + './main.bundle',
  enableProdMode: true,
  cdnCacheExpiry: 600,
  browserCacheExpiry: 300,
  staleWhileRevalidate: 120,
  extraProviders: [
      provideModuleMap(LAZY_MODULE_MAP)
  ]
});
```
Install the `angular-universal-express-firebase` package inside the `functions` folder, which you'll
have once you init the firebase setup (check in google tools repository).
```bash
$ npm i -S angular-universal-express-firebase
```
Also, now you need to change the `outDir` of your `angular.json` to point to `functions/lib`.  
In addition, add this command to your `package.json` scripts:
```json
{
  "move-index": "mv ./dist/index.html ./functions/lib/index-universal.html"
}
```
Now, run:
```bash
npm run build:client-app:prod
# frontend build is completed
npm run build:server-app:prod
# production build is completed
npm run move-index
```
To finish, copy all production `dependencies` of your main `package.json` to the functions `package.json`. Now
run `npm i` inside the `functions` folder.
