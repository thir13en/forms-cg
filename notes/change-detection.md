# Change Detection

By default, the change detection of Angular is runt every time any template
expression has been changed. Angular scans the whole component tree when events take 
place, looking for changes.
The tradeoff is that the default change detection mechanism is quite expensive and 
can cause some performance issues on heavy applications.

### Common pitfalls
It is quite frequent in newbies in Angular, that they struggle with the `OnPush` change detection
due to it not running when properties of the object they are passing as an attribute input to the 
component change. This is due to the fact that the change detector does comparison by reference and not
deep change property comparison, so the main solution to this problem is to clone or copy the object
or array that we modified and then assign the new value to the object we are passing down to the 
component.

### OnPush Change Detection
It is also triggered by default via an event handler (click, keyup, etc.),
Programmatic changes, for instance, assignation in the controller of the component,
will not trigger a change detection cycle thou. TODO: test this because it is
likely that changes within the same component template are indeed managed.
If a parent component mutates the data of a component with OnPush, change detection,
the change won't be detected and hence template won't be updated.  
It is important to note that if the parent component does create a new 
pointer for the object being passed to the child, then change detection is able to
recognize that there is a change and updates the view accordingly.  
`OnPush` triggers a change detection mechanism when:
* There is a reference change in a component `Input`
* An `EventEmmiter` is triggered within a component. 
* When an `Observable` subscribed in the view fires an event.
The main risk of `OnPush` change detection mechanism is that it becomes really 
difficult to manage when we our app allows for mutability of objects.

### Why OnPush is more performant?
With Default change detection we check all the expressions in all the component tree
every time there is a change in one place, whereas with OnPush we can manage with
more granularity when will this take place. Also, OnPush does not check for mutations within
the objects that are passed, only new assignation to them, enforcing immutability.

### OnPush and Observables
`OnPush` Change Detection will look at the observable streams via `async` pipe,
in this case it is a highly performant and recommendable use case.
It is different thou with `subscribe and assign` method, because OnPush is quite dumb
when it comes to detect changes through assignations happening at the level of the
controller.

### A little optimization, the `@Attribute` decorator
When a component receives a property that we know will not change, for instance:
```angular2html
<component-name fixedAttribute="value"></component-name>
```
In the component
```angular2
@Component({

})
export class ComponentName {
    constructor(@Attribute('fixedAttribute') public arbitraryName: Type) {}
}
...
```
We can call this `one time binding`.

### Custom managing of change detection via the `ChangeDetectionRef`
Every component in Angular has an instance of the change detection mechanism
that we can inject via the constructor and use.
You can override the components OnPush ch detection with the method.
```angular2
private cd: ChangeDetectorRef,
....
this.cd.markForCheck()
```

### When is a Change Detection `tick` triggered?
* After a DOM event callback
* After an AJAX callback
* After a `setTimeout` callback
* After a `setInterval` callback
* After a Websocket callback
* After an `alert` has been triggered

### Patching Browser API
Angular achieves to run custom change detection by patching the native Browser API, with
something that looks like this.
```javascript
// this is the new version of addEventListener
function addEventListener(eventName, callback) {
     // call the real addEventListener
     callRealAddEventListener(eventName, function() {
        // first call the original callback
        callback(...);
        // and then run Angular-specific functionality
        var changed = angular2.runChangeDetection();
         if (changed) {
             angular2.reRenderUIPart();
         }
     });
}
```
This low-level patching of browser APIs is done by a library shipped with Angular 
named `zone.js`. A `zone` is nothing more than an execution context that survives multiple 
`Javascript VM` execution turns. It's a generic mechanism which we can use to add extra 
functionality to the browser. Angular uses `zones` internally to trigger change detection.  
One limitation of this mechanism is that if by some reason an asynchronous browser API 
has no support by `zone.js`, then change detection will not be triggered. This is, 
for example, the case of `indexedDB` callbacks.

### Change Detection and nested properties
By default, Angular `Change Detection` works by checking if the value of 
template expressions have changed. This is done for all components.    
Angular does not do `deep` object comparison to detect changes, it only 
takes into account properties used by the template. 

### Change Detection and Development mode
In Development mode, change detection are always runt twice, one for the normal 
change detection cycle, and a second one to detect changes in properties during the 
very same change detection cycle, which shouldn't happen.

### What Is the Digest Cycle?
Digest cycle is the process of monitoring watchlist to track the changes in the 
value of the watch variable. The digest cycle triggers implicitly, but we can also 
trigger it manually using `$apply()` function.
