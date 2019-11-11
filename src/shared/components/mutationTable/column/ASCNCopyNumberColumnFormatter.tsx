import * as React from 'react';
import DefaultTooltip from "public-lib/components/defaultTooltip/DefaultTooltip";
import 'rc-tooltip/assets/bootstrap_white.css';
import {MolecularProfile, Mutation, ClinicalData} from "shared/api/generated/CBioPortalAPI";
import {default as TableCellStatusIndicator, TableCellStatus} from "public-lib/components/TableCellStatus";
import {hasASCNProperty} from "shared/lib/MutationUtils";

export const ascnCallTable:{[key:string]:string} = {
    "no WGD,0,0":"Homiodel",
    "no WGD,1,0":"Hetloss",
    "no WGD,2,0":"CNLOH",
    "no WGD,3,0":"CNLOH & Gain",
    "no WGD,4,0":"CNLOH & Gain",
    "no WGD,5,0":"Amp (LOH)",
    "no WGD,6,0":"Amp (LOH)",
    "no WGD,1,1":"Diploid",
    "no WGD,2,1":"Gain",
    "no WGD,3,1":"Gain",
    "no WGD,4,1":"Amp",
    "no WGD,5,1":"Amp",
    "no WGD,6,1":"Amp",
    "no WGD,2,2":"Tetraploid",
    "no WGD,3,2":"Amp",
    "no WGD,4,2":"Amp",
    "no WGD,5,2":"Amp",
    "no WGD,6,2":"Amp",
    "no WGD,3,3":"Amp (Balanced)",
    "no WGD,4,3":"Amp",
    "no WGD,5,3":"Amp",
    "no WGD,6,3":"Amp",
    "WGD,0,0":"Homdel",
    "WGD,1,0":"Loss Before & After",
    "WGD,2,0":"Loss Before",
    "WGD,3,0":"CNLOH Before & Loss",
    "WGD,4,0":"CNLOH Before",
    "WGD,5,0":"CNLOH Before & Gain",
    "WGD,6,0":"Amp (LOH)",
    "WGD,1,1":"Double Loss After",
    "WGD,2,1":"Loss After",
    "WGD,3,1":"CNLOH After",
    "WGD,4,1":"Loss & Gain",
    "WGD,5,1":"Amp",
    "WGD,6,1":"Amp",
    "WGD,2,2":"Tetraploid",
    "WGD,3,2":"Gain",
    "WGD,4,2":"Amp",
    "WGD,5,2":"Amp",
    "WGD,6,2":"Amp",
    "WGD,3,3":"Amp (Balanced)",
    "WGD,4,3":"Amp",
    "WGD,5,3":"Amp",
    "WGD,6,3":"Amp"
}

export const ascnColorTable:{[key:string]:string} = {
    "2":"red",
    "1":"#e15b5b",
    "0":"#BCBCBC",
    "-1":"#2a5eea",
    "-2":"blue"
}
    
// gets the FACETES call (e.g tetraploid, amp, cnloh)
export function getAscnCall(mcn:number, lcn:number, wgd:string) {
    const key: string = [wgd, mcn.toString(), lcn.toString()].join(",");
    return key in ascnCallTable ? ascnCallTable[key] : "NA"; 
}

// gets value displayed in table cell - "NA" if missing attributes needed for calculation
export function getAscnCopyNumberData(mutation:Mutation, sampleIdToClinicalDataMap:{[sampleId:string]:ClinicalData[]}|undefined) {
    return hasASCNProperty(mutation, "ascnIntegerCopyNumber") ? mutation.alleleSpecificCopyNumber.ascnIntegerCopyNumber : "NA"; 
}

// returns an element (rounded rectangle with tcn inside - coloring based on FACETS CopyNumber number equivalent)
export function formatASCNCopyNumberData(ascnCopyNumberData:string, tcn:string, wgd:null|string) {
    let color = ""
    let opacity = 0;
    const textcolor = "white"
    if (ascnCopyNumberData in ascnColorTable) {
        color = ascnColorTable[ascnCopyNumberData];
        opacity = 100;
    } 
    return getASCNCopyNumberIcon(tcn, color, opacity, wgd, textcolor);
}

export function getASCNCopyNumberIcon(cnaNumber:string, color:string, opacity:number, wgd:null|string, textcolor:string) {
    let size = 9;
    let fillColor = color;
    let cnaTextValue = cnaNumber === "NA" ? "" : cnaNumber;
    
    let ascnCopyNumberIconRectangle = <rect width='12' height='12' rx='15%' ry='15%' fill={fillColor} opacity={opacity}/>
    let wgdStringSVG = wgd === "WGD" ?
        <svg>
            <text x='9' y='5' dominantBaseline='middle' fontWeight='bold' textAnchor='middle' fontSize='7' fill='black'>WGD</text>
        </svg> : null;

    return (
        <svg width='18' height='20' className='case-label-header'>
            {wgdStringSVG}
            <g transform="translate(3,8)">
                {ascnCopyNumberIconRectangle}
                <svg>
                    <text x='6' y='7' dominantBaseline='middle' textAnchor='middle' fontSize={size} fill={textcolor}>{cnaTextValue}</text>
                </svg>
            </g>
        </svg>
    );
}

export function getWGD(sampleIdToClinicalDataMap:{[sampleId:string]:ClinicalData[]}|undefined, sampleId:string) {
    let wgdData = sampleIdToClinicalDataMap ?  
        sampleIdToClinicalDataMap[sampleId].filter((cd: ClinicalData) => cd.clinicalAttributeId === "FACETS_WGD") : undefined;
    return (wgdData !== undefined && wgdData.length > 0) ? wgdData[0].value : null; 
}
    

export default class ASCNCopyNumberColumnFormatter {

    public static getASCNCopyNumberTooltip(mutation:Mutation, sampleIdToClinicalDataMap:{[sampleId:string]:ClinicalData[]}|undefined) {
        const sampleId:string = mutation.sampleId;
        let wgd = getWGD(sampleIdToClinicalDataMap, sampleId);
        if (!hasASCNProperty(mutation, "totalCopyNmber") || 
            !hasASCNProperty(mutation, "minorCopyNumber") || 
            !hasASCNProperty(mutation, "ascnIntegerCopyNumber") || 
            wgd === null) {
            return <span><b>NA</b></span>;
        }
        const tcn = mutation.alleleSpecificCopyNumber.totalCopyNumber;
        const lcn = mutation.alleleSpecificCopyNumber.minorCopyNumber;
        const mcn:number = tcn - lcn;
        let ascnTooltip = getAscnCall(mcn, lcn, wgd).toLowerCase()
        return (
            <span>
                <b>{ascnTooltip}</b> ({wgd} with total copy number of {tcn.toString(10)} and a minor copy number of {lcn.toString(10)})
            </span>
        );
    }

    public static getSortValue(data:Mutation[], sampleIdToClinicalDataMap: {[key: string]:ClinicalData[]}|undefined, sampleIds:string[]) {
        const displayValuesBySample:{[key: string]: string} = ASCNCopyNumberColumnFormatter.getAllTotalCopyNumberForMutation(data, sampleIdToClinicalDataMap, sampleIds);
        const sampleIdsWithValues = sampleIds.filter(sampleId => displayValuesBySample[sampleId]);
        const displayValuesAsString = sampleIdsWithValues.map((sampleId:string) => {
            return displayValuesBySample[sampleId];
        })
        return displayValuesAsString.join(";");
    }

    public static filter(data:Mutation[], sampleIdToClinicalDataMap: {[key: string]:ClinicalData[]}|undefined, sampleIds:string[], filterString:string):boolean {
        const displayValuesBySample:{[key: string]: string} = ASCNCopyNumberColumnFormatter.getAllTotalCopyNumberForMutation(data, sampleIdToClinicalDataMap, sampleIds);
        const sampleIdsWithValues = sampleIds.filter(sampleId => displayValuesBySample[sampleId]);
        const displayValuesAsString = sampleIdsWithValues.map((sampleId:string) => {
            return displayValuesBySample[sampleId];
        })
        return displayValuesAsString.join(";").toLowerCase().indexOf(filterString.toLowerCase()) > -1;
    }
    // sort by total copy number (since that is the number displayed in the icon
    public static getAllTotalCopyNumberForMutation(data:Mutation[], sampleIdToClinicalDataMap: {[key: string]:ClinicalData[]}|undefined, sampleIds:string[]) {
        const sampleToCNA:{[key: string]: string} = {};
        for (const mutation of data) {
            const ascnCopyNumberData = getAscnCopyNumberData(mutation, sampleIdToClinicalDataMap);
            if (ascnCopyNumberData !== "NA") {
                sampleToCNA[mutation.sampleId] = mutation.alleleSpecificCopyNumber.totalCopyNumber.toString();
            } else {
                sampleToCNA[mutation.sampleId] = "NA";
            }
        }
        return sampleToCNA;
    }


    public static renderFunction(data: Mutation[], sampleIdToClinicalDataMap: {[key: string]:ClinicalData[]}|undefined, sampleIds:string[]) {
        const displayValuesBySample:{[key:string]:JSX.Element} = ASCNCopyNumberColumnFormatter.getElementsForMutations(data, sampleIdToClinicalDataMap);
        const sampleIdsWithElements = sampleIds.filter(sampleId => displayValuesBySample[sampleId]);
        if (!sampleIdsWithElements) {
            return <span />;
        } else {
            // map to sampleIds instead of sampleIdsWithElements so that each icon will line up
            // positionally (e.g col 1 will always be sample 1, col 2 will always be sample 2
            // even if sample 1 doesn't have an icon)
            let content = sampleIds.map((sampleId:string) => {
                let displayElement = displayValuesBySample[sampleId] !== undefined ? 
                    displayValuesBySample[sampleId] : <svg width='18' height='20' className='case-label-header' />;
                // if current item is not last samle in list, seperate withs space
                if (sampleIdsWithElements.indexOf(sampleId) !== (sampleIdsWithElements.length -1)) {
                    return <li>{displayElement}<span style={{fontSize:"small"}} /></li>;
                }
                return <li>{displayElement}</li>;
            })
            return (
             <span style={{display:'inline-block', minWidth:100}}>
                 <ul style={{marginBottom:0}} className="list-inline list-unstyled">{ content }</ul>
             </span>
            );
        }
    }

    // map sample id to an element (square with tcn inside)
    public static getElementsForMutations(data:Mutation[], sampleIdToClinicalDataMap: {[key: string]:ClinicalData[]}|undefined) {
        const sampleToElement:{[key: string]: JSX.Element} = {};
        for (const mutation of data) {
            const element = ASCNCopyNumberColumnFormatter.getElement(mutation, sampleIdToClinicalDataMap);
            sampleToElement[mutation.sampleId] = element;
        }
        return sampleToElement;
    }

    public static getElement(mutation:Mutation, sampleIdToClinicalDataMap: {[key: string]:ClinicalData[]}|undefined) {
        const sampleId:string = mutation.sampleId;
        // three values needed to generate icon
        const wgd = getWGD(sampleIdToClinicalDataMap, sampleId);
        const tcn = hasASCNProperty(mutation, "totalCopyNumber") ? mutation.alleleSpecificCopyNumber.totalCopyNumber : "NA";
        const ascnCopyNumberData = getAscnCopyNumberData(mutation, sampleIdToClinicalDataMap);
        
        let cnaIconElement = null; 
        if (ascnCopyNumberData === "NA" || tcn === "NA" || wgd === null) {
            // if any required props are missing - generate an "invisible" rectangular icon
            cnaIconElement = formatASCNCopyNumberData("NA", "NA", null);
            return cnaIconElement;
        } else {
            cnaIconElement = formatASCNCopyNumberData(ascnCopyNumberData.toString(), tcn.toString(), wgd);
        }
        const cnaToolTip = ASCNCopyNumberColumnFormatter.getASCNCopyNumberTooltip(mutation, sampleIdToClinicalDataMap);
        return (<DefaultTooltip placement="left"
                    overlay={cnaToolTip}
                    arrowContent={<div className="rc-tooltip-arrow-inner"/>}
                >
                    {cnaIconElement}
                </DefaultTooltip>
        );
    }
}
