const UI = {
    Row: (id, childs) => {
        const row = document.createElement('div')
        row.classList.add('elaina-theme-settings-row')
        row.id = id
        if (Array.isArray(childs)) childs.forEach((el) => row.appendChild(el))
        return row
    },
    Link: (text, href, onClick, ID) => {
        const link = document.createElement('p')
        link.classList.add('lol-settings-code-of-conduct-link')
        link.classList.add('lol-settings-window-size-text')
    
        const a = document.createElement('a')
        a.innerText = text
        a.target = '_blank'
        a.href = href
        a.onclick = onClick || null
        a.download
        a.id = ID || null
    
        link.append(a)
        return link
    },
    CheckBox: (text, ID, boxID, check, show, datastore_name) => {
        const container = document.createElement("div")
        const origin = document.createElement("lol-uikit-flat-checkbox")
        const checkbox = document.createElement("input")
        const label = document.createElement("label")
        const none = document.createElement("div")

        origin.id = ID
        origin.setAttribute("lastDatastore", window.DataStore.get(datastore_name))
    
        checkbox.type = "checkbox"
        checkbox.id = boxID
        if (window.DataStore.get(datastore_name)){
            checkbox.checked = true
            origin.setAttribute("class", "checked")
        }
        else {
            checkbox.checked = false
            origin.setAttribute("class",'')
        }

        checkbox.onclick = () => {
            if (window.DataStore.get(datastore_name)) {
                origin.removeAttribute("class")
                checkbox.checked = false
                window.DataStore.set(datastore_name, false)
                check()
            }
            else {
                origin.setAttribute("class", "checked")
                checkbox.checked = true
                window.DataStore.set(datastore_name, true)
                check()
            }
        }
        checkbox.setAttribute("slot", "input")
    
        label.innerHTML = text
        label.setAttribute("slot", "label")
    
        if (show) {
            container.appendChild(origin)
            origin.appendChild(checkbox)
            origin.appendChild(label)
    
            return container
        }
        else {
            container.appendChild(none)
            return container
        }
    },
    FakeRunesPagesManager: (datastore) => {
        const origin = document.createElement("div")

        let create = () => {
            const mainDiv = document.createElement("div")
            mainDiv.id = "elaina-frp"

            for (let i = 0; i < datastore.length; i++) {
                let div = document.createElement("div")
                div.style.cssText = `
                    display: flex;
                    margin-bottom: 10px;
                `

                let deleteButton = document.createElement("lol-uikit-close-button")
                deleteButton.setAttribute("button-type", "delete")
                deleteButton.onclick = () => {
                    document.getElementById(`elaina-frp`)?.remove()
                    datastore = datastore.filter(page => page["name"] != datastore[i]["name"])
                    console.log(datastore)
                    window.DataStore.set("fake-rune-pages", datastore)
                    origin.append(create())
                }

                let runesName = document.createElement('p')
                runesName.classList.add('lol-settings-window-size-text')
                runesName.innerText = datastore[i]["name"]
                runesName.style.cssText = `
                    margin-left: 12px;
                    margin-top: 6px;
                `

                div.append(deleteButton, runesName)
                mainDiv.append(div)
            }

            return mainDiv
        }

        origin.append(create())
        return origin
    },
    Label: (text, id) => {
        const label = document.createElement('p')
        label.classList.add('lol-settings-window-size-text')
        label.innerText = text
        label.id = id
        return label
    },
    Button: (text, cls, onClk) => {
        const btn = document.createElement('lol-uikit-flat-button-secondary')
        btn.innerText = text
        btn.onclick = onClk
        btn.style.display = 'flex'
        btn.setAttribute('class', cls)
        return btn
    },
    fileInput: (Id, acceptFile, onChange) => {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = acceptFile
        input.id = Id
        input.onchange = onChange
        input.style.display = "none"

        return input
    }
}

export { UI }