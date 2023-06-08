# hss
**hss** stands for **Hardware Simulator System**, and it litterally is what you think it is.

## How to Use

1. First, you need to clone the [GitHub Repo] or to download the [ZIP File].
    ```sh
    git clone https://github.com/SinisterIcy/hss
    ```
2. Then, copy the `hss.js` file to your **project directory**.
3. Import the `shell` function from the `hss.js` file:
    ```js
    const { shell } = require('hss.js')
    ```
4. Finally, just execute your command by using `shell('<command>')`
    ```js
    shell('log')
    ```

## Commands

**hss** has an integrated shell able to run a variety of commands such as:
- [vertex]
- [link]
- [update]
- [eval]
- [log] (WIP)
- [assign] (WIP)
- [vertices] (WIP)

### vertex

#### Syntax
```
vertex <name> [value]
```

Creates a new vertex called `name` with the value `value`.
If a `value` is not specified, it will use `0` instead.

#### Example
```
vertex a 1
```
Creates a new vertex called `a` with the value `1`.

### link

#### Syntax
```
link <first_element> <second_element>
```

Links `first_element` to `second_element`.

#### Example
```
vertex a
vertex b
link a b
```
Creates `a` and `b`, and then links them together

### update

#### Syntax
```
update <vertex> [value]
```

Updates `vertex` and spread `value` (or its value if not specified)

#### Example
```
vertex a
vertex b
link a b
update a 1
```
Creates `a` and `b`, links them together, and then spreads `1` from `a`.
After that, `b` will also be `1`

### eval

#### Syntax
```
eval <vertex>
```

Prints the value of the vertex

#### Example
```
vertex a
eval a
```
Creates `a` with the value `1`.
Prints `a`'s value (`1`)

[GitHub Repo]: https://github.com/SinisterIcy/hss
[ZIP File]: https://github.com/SinisterIcy/hss/archive/refs/heads/main.zip
[vertex]: #vertex
[link]: #link
[update]: #update
[eval]: #eval
[log]: #log
[assign]: #assign
[vertices]: #vertices
