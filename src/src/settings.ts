import { UI } from "./settingsUI.ts"
import { log } from "./log.ts"

async function getSummonerID(): Promise<number> {
    const response = await fetch("/lol-summoner/v1/current-summoner");
    const data = await response.json();
    return JSON.parse(data.summonerId);
}

function addStyle(style: string) {
    const styleElement = document.createElement('style');
    styleElement.appendChild(document.createTextNode(style));
    document.body.appendChild(styleElement);
}

class Settings {
    data: { 
        groupName: string; 
        titleKey: string; 
        titleName: string; 
        capitalTitleKey: string; 
        capitalTitleName: string; 
        element: { 
            name: string; 
            title: string; 
            titleName: string; 
            class: string; 
            id: string 
        }[] 
    }[]
    
    constructor () {
        this.data = [
            {
                "groupName": 'fake-runes-pages',
                "titleKey": 'el_fake-runes-pages',
                "titleName": 'Fake runes pages',
                "capitalTitleKey": 'el_fake-runes-pages_capital',
                "capitalTitleName": 'FAKE RUNES PAGES',
                "element": [
                    {
                        "name": "fake-runes-pages-settings",
                        "title": "el_fake-runes-pages-settings",
                        "titleName": "DELETE PAGES",
                        "class": "fake-runes-pages-settings",
                        "id": "fake-runes-pages-settings",
                    },
                    {
                        "name": "fake-runes-pages-backup-restore",
                        "title": "el_fake-runes-pages-backup-restore",
                        "titleName": "BACKUP & RESTORE",
                        "class": "fake-runes-pages-backup-restore",
                        "id": "fake-runes-pages-backup-restore",
                    },
                ],
            },
        ]
    }

    settingsUI = (panel: any) => {
        panel.prepend(
            UI.Row("",[
                UI.Row("Info",[
                    UI.Row("Info-div",[
                        UI.Link(
                            'Fake runes pages',
                            'https://github.com/Elaina69/',
                            () => {},""
                        )
                    ]),
                ]),
                UI.FakeRunesPagesManager(window.DataStore.get("fake-rune-pages"))
            ])
        )
    }

    backupRestoreUI = (panel: any) => {
        panel.prepend(
            UI.Row("",[
                UI.Row("Info",[
                    UI.Row("Info-div",[
                        UI.Link(
                            'Fake runes pages',
                            'https://github.com/Elaina69/',
                            () => {},""
                        )
                    ]),
                ]),
                UI.Row("manualRestoreBackup", [
                    UI.Button("Backup", "FRPManualBackup", async () => {
                        window.DataStore.set("last-backup-time", new Date())
                        let sumID = await getSummonerID()
                        let data = window.DataStore.get("fake-rune-pages")
    
                        let blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
                        let a: any = document.getElementById("frpdownloadBackup")
                        
                        a.href = URL.createObjectURL(blob)
                        a.download = `Fake_Runes_Pages-${sumID}.json`
                        a.click()
                        a.href = ""
                    }),
                    document.createElement('br'),
                    UI.Row("FRPRestoreRow", [
                        UI.Button("Restore","FRPManualRestore", () => {
                            document.getElementById("manualRestoreInput")?.click()
                        }),
                        UI.Label("", "restoreFileInfo")
                    ]),
                    UI.fileInput("manualRestoreInput", ".json", async (event)=> {
                        const file = event.target.files[0]
                        let text: any = document.getElementById("restoreFileInfo")
                        
                        if (file && file.type === "application/json") {
                            const reader = new FileReader();
                        
                            reader.onload = async (e: any) => {
                                text.style.color = "#e4c2b3"
                                
                                try {
                                    const json = JSON.parse(e.target.result);
                                    let restoreData = new Promise<void>((resolve, reject) => {
                                        setTimeout(async () => {
                                            try { 
                                                window.DataStore.set("fake-rune-pages", json)
                                                resolve()
                                            }
                                            catch {
                                                reject()
                                                log(`File not found, avoid restoring`)
                                            }
                                        },5000)
                                    })
                                    
                                    window.Toast.promise(restoreData, {
                                        loading: 'Restoring runes pages...',
                                        success: 'Restore complete!',
                                        error: 'Error while restoring data, check console for more info!'
                                    })
                                } 
                                catch {
                                    text.textContent = "Invalid JSON file!"
                                    text.style.color = "red"
                                }
                            };
                        
                            reader.readAsText(file);
                        } 
                        else {
                            text.textContent = "Accept .json file only!"
                            text.style.color = "red"
                        }
                    }),
                    UI.Link("", ``, ()=> {}, "frpdownloadBackup")
                ]),
            ])
        )
    }

    injectSettingsUI = () => {
        const interval = setInterval(() => {
            const manager = document.getElementById('lol-uikit-layer-manager-wrapper')
            
            if (manager) {
                clearInterval(interval)
                new MutationObserver((mutations) => {
                    const settings = document.querySelector('lol-uikit-scrollable.fake-runes-pages-settings')
                    const backupRestore = document.querySelector('lol-uikit-scrollable.fake-runes-pages-backup-restore')

                    if (settings && mutations.some((record) => Array.from(record.addedNodes).includes(settings))) {
                        this.settingsUI(settings)
                    }
                    else if (backupRestore && mutations.some((record) => Array.from(record.addedNodes).includes(backupRestore))) {
                        this.backupRestoreUI(backupRestore)
                    }
                }).observe(manager, {
                    childList: true,
                    subtree: true
                })
            }
        },500)
    }
}
let settings = new Settings()

window.addEventListener("load", () => {
    addStyle(`
        .FRPManualRestore {
            margin-left: 25px !important;
        }

        .FRPManualBackup {
            margin-left: 25px !important;
            width: 90px !important;
            display: block !important;
        }

        #frpdownloadBackup {
            display: none !important;
        }

        #FRPRestoreRow {
            display: flex !important;
        }
    `)
})

export { settings }