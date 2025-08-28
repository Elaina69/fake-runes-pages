import * as upl from "./src/index.js"
import { log } from "./src/log.ts"
import { fakeRunePages } from "./src/fakeRunePage.ts"
import { settings } from "./src/settings.ts"
import { settingsUtils } from "./src/settingsUtils.ts"

if (!window.DataStore.has("fake-rune-pages")) {
    window.DataStore.set("fake-rune-pages", [])
}

let isSaving = false
let selectedPageIndex: number | null = null

window.addEventListener("load", () => {
    // Add button to runes setup
    upl.observer.subscribeToElementCreation(".perks-body-header", (element: any) => {
        if (!element) return

        try {
            document.querySelector(".save-fake-rune-pages-button")?.remove()
        } catch {}

        if (!document.querySelector(".save-fake-rune-pages-button")) {
            let button = document.createElement("lol-uikit-flat-button")
            button.setAttribute("class", "save-fake-rune-pages-button")
            button.style.marginLeft = "10px"
            button.textContent = "Save runes to DataStore"
            button.onclick = async () => { 
                if (!isSaving) {
                    isSaving = true
                    log("Saving rune page...")
                    await fakeRunePages.savePageInfo()
                    let saveFakeRunesPages = new Promise<void>((resolve, reject) => {
                        setTimeout(async () => {
                            try { 
                                await fakeRunePages.saveFakePageInfo()
                                isSaving = false
                                resolve()
                            }
                            catch {
                                reject()
                            }
                        },3000)
                    })
                    
                    window.Toast.promise(saveFakeRunesPages, {
                        loading: 'Saving rune page...',
                        success: 'Saved!',
                        error: 'Error while saving runes pages, check console for more info!'
                    })
                }
            }
            element.append(button)
        }
    })

    // Add dropdown to champs select
    upl.observer.subscribeToElementCreation(".loadout-edit-controls", (element: any) => {
        if (!element) return

        try {
            document.querySelector("#fake-rune-page-dropdown")?.remove()
        } catch {} 
        
        if (!document.querySelector("#fake-rune-page-dropdown")) {
            const dropdown = document.createElement("lol-uikit-framed-dropdown")
            dropdown.classList.add("lol-settings-general-dropdown")
            dropdown.id = "fake-rune-page-dropdown"
            dropdown.style.cssText = `width: 200px;`

            let fakePageList = window.DataStore.get("fake-rune-pages")

            for (let i = 0; i < fakePageList.length; i++) {
                let el = document.createElement("lol-uikit-dropdown-option")

                el.setAttribute("slot", "lol-uikit-dropdown-option")
                el.innerText = fakePageList[i]["name"]
                el.onclick = async () => {
                    await fakeRunePages.setRunePageToCurrentChamp(fakePageList[i])
                    selectedPageIndex = i
                }
                dropdown.appendChild(el)
            }

            element.prepend(dropdown)
        }
    })

    upl.observer.subscribeToElementDeletion(".loadout-edit-controls", (element: any) => {
        selectedPageIndex = null
    })

    // Global interval to check for changes in the selected rune page
    window.setInterval(async () => {
        if (selectedPageIndex === null) return
        else {
            let fakePageList = window.DataStore.get("fake-rune-pages")
            await fakeRunePages.setRunePageToCurrentChamp(fakePageList[selectedPageIndex])
        }
    }, 1000)

    // Inject settings ui
    settings.injectSettingsUI()
})

export function init(context: any) {
    settingsUtils(context, settings.data)
}