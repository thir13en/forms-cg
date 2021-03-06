# Modules


An Angular Module is mainly a **template compilation context**, but it also helps to define
a public API for a subset of functionalities, as well as help with the dependency 
injection configuration of our app.

### Motivation
Each HTML tag goes through a comparison to a list to see if a component should be applied on 
top of it, the same goes for each attribute. The problem is: how does Angular know which components, 
directives and pipes should it be looking for while parsing the HTML? Modules are the responsibles for
providing this list.

### Providers Array
Includes `Components`, `Directives` and `Pipes`.
