import * as upl from "./src/index.js"
import { log } from "./src/log.ts"
import { fakeRunePages } from "./src/fakeRunePage.ts"
import { settings } from "./src/settings.ts"
import { settingsUtils } from "./src/settingsUtils.ts"

if (!window.DataStore.has("fake-rune-pages")) {
    window.DataStore.set("fake-rune-pages", [])
}

let isSaving = false
let selectedPageIndex: number = -1
let rewriteRitoAutoRune: boolean = false;

let saveFakeRuneAfterEdit = async () => {
    if (!isSaving) {
        isSaving = true
        log("Saving rune page...")

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

window.saveFakeRuneAfterEdit = saveFakeRuneAfterEdit

window.addEventListener("load", () => {
    // Add onClick attribute to save button
    upl.observer.subscribeToElementCreation(".perks-header-content-group > .save-page", (element: any) => {
        log("Editing runes page")
        element.setAttribute("onClick", "window.saveFakeRuneAfterEdit()")  
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
                    selectedPageIndex = i
                    await fakeRunePages.setRunePageToCurrentChamp(fakePageList[i])
                }
                dropdown.appendChild(el)
            }

            element.prepend(dropdown)
        }
    })

    upl.observer.subscribeToElementDeletion(".loadout-edit-controls", (element: any) => {
        selectedPageIndex = -1
        rewriteRitoAutoRune = false
    })

    // Global interval to check for changes in the selected rune page
    window.setInterval(async () => {
        let currentChampselectTime = fakeRunePages.checkTime()
        let fakePageList = window.DataStore.get("fake-rune-pages")

        if (3 <= currentChampselectTime && currentChampselectTime <= 6) {
            // log("test 2")

            if (!rewriteRitoAutoRune) return
            if (selectedPageIndex == -1) return

            await fakeRunePages.setRunePageToCurrentChamp(fakePageList[selectedPageIndex])
        }
        else {
            let currentPage = (await (await fetch("/lol-perks/v1/pages")).json())[0]
            if (currentPage.runeRecommendationId != "ElainaDaCatto") {
                selectedPageIndex = -1
                rewriteRitoAutoRune = false
                // log("test 3")
            }
            else {
                selectedPageIndex = fakePageList.findIndex(page => page.name == currentPage.name)
                rewriteRitoAutoRune = true
                // log("test 4")
            }
        }

        // log("index:", selectedPageIndex, ", rewriteRitoAutoRune:", rewriteRitoAutoRune)
    }, 300)

    // Inject settings ui
    settings.injectSettingsUI()
})

export function init(context: any) {
    settingsUtils(context, settings.data)
}