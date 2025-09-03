import { log } from "./log.ts"
class FetchData {
    get = async (lcu: string) => {
        let data = (await fetch(lcu)).json()
        return data
    }

    post = async (lcu: string, body: any) => {
        await fetch(lcu, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
    }
}

class FakeRunePages extends FetchData {
    checkTime(): number {
        let text = document.querySelector(".timer-container > .timer")?.innerHTML as string
        let number = parseInt(text?.trim());
        
        return number;  
    }

    async getPageInfo(): Promise<{name: string, selectedRunes: number[], primaryStyle: number, subStyle: number}> {
        let pageInfo = await this.get("/lol-perks/v1/currentpage")
        let fakePageInfo = {
            "name": pageInfo.name,
            "selectedRunes": pageInfo.selectedPerkIds,
            "primaryStyle": pageInfo.primaryStyleId,
            "subStyle": pageInfo.subStyleId

        }
        
        return fakePageInfo
    }

    async saveFakePageInfo() {
        let currentPage = await this.getPageInfo()
        let fakeRuneList: Array<{name: string, selectedRunes: number[], primaryStyle: number, subStyle: number}> = window.DataStore.get("fake-rune-pages")
        let isDuplicated = false
        let duplicatIndex = 0

        for (let i = 0; i < fakeRuneList.length; i++) {
            if (fakeRuneList[i]["name"] == currentPage["name"]) {
                log("Runes duplicated")
                isDuplicated = true
                duplicatIndex = i
            }
        }
        
        if (!isDuplicated) {
            fakeRuneList.push(currentPage)
            window.DataStore.set("fake-rune-pages", fakeRuneList)
        }
        else {
            fakeRuneList = fakeRuneList.filter((page: { [x: string]: any }) => page["name"] != fakeRuneList[duplicatIndex]["name"])
            fakeRuneList.push(currentPage)
            window.DataStore.set("fake-rune-pages", fakeRuneList)
        }

        log("Saved")
    }

    async setRunePageToCurrentChamp(page: {name: string, selectedRunes: number[], primaryStyle: number, subStyle: number}) {
        await this.post("/lol-perks/v1/pages", {
            "name": page["name"],
            "selectedPerkIds": page["selectedRunes"],
            "order":1,
            "primaryStyleId": page["primaryStyle"],
            "subStyleId": page["subStyle"],
            "isTemporary": true,
            "runeRecommendationId": "ElainaDaCatto",
            "isRecommendationOverride": false,
            "recommendationIndex": 0
        })
    }
}

const fakeRunePages = new FakeRunePages()

export { fakeRunePages }