const ENDPOINT = "https://interactives.apelections.org/election-results/data-live/2024-11-05/results/national/progress.json";

const CANDIDATES = {
    "64984": "Kamala Harris",
    "8639": "Donald Trump"
}

const STATE_CODES = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "DC",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
]

function convertToRaceId(stateCode) {
    return `20241105${stateCode}0`
}

const raceIds = STATE_CODES.map(convertToRaceId);

function parseRaceData(raceData, lastCheckedTimestamp) {
    const winner = raceData.candidates.find((candidateData) => candidateData.winner === "X") || null;
    return {
        statePostal: raceData.statePostal,
        stateName: raceData.stateName,
        reportingPct: raceData.precinctsReportingPct,
        electTotal: raceData.electTotal,
        winner: winner ? CANDIDATES[winner.candidateID] : null,
        new: winner ? new Date(winner.calledAt) > new Date(lastCheckedTimestamp) : false
    }
}

export async function fetchProgress(lastCheckedTimestamp) {
    try {
        const res = await fetch(ENDPOINT);
        const data = await res.json();

        const statesProgress = Object.entries(data).filter(([raceId]) => raceIds.includes(raceId)).map(([_, raceData]) => parseRaceData(raceData, lastCheckedTimestamp));
        const nationalProgress = parseRaceData(data[convertToRaceId("US")], lastCheckedTimestamp);

        return {
            statesProgress,
            nationalProgress
        };
    } catch {
        return null;
    }
}
