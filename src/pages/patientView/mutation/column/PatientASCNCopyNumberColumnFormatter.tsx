import * as React from 'react';
import DefaultTooltip from "public-lib/components/defaultTooltip/DefaultTooltip";
import 'rc-tooltip/assets/bootstrap_white.css';
import {Mutation, ClinicalData} from "shared/api/generated/CBioPortalAPI";
import {default as TableCellStatusIndicator, TableCellStatus} from "public-lib/components/TableCellStatus";
import SampleManager from "../../SampleManager";
import {ascnCallTable, 
    ascnColorTable, 
    getAscnCopyNumberData, 
    getAscnCall,
    getWGD,
    formatASCNCopyNumberData} from "shared/components/mutationTable/column/ASCNCopyNumberColumnFormatter";
import {hasASCNProperty} from "shared/lib/MutationUtils";

export default class PatientASCNCopyNumberColumnFormatter {

    public static getASCNCopyNumberTooltip(mutation:Mutation, sampleIdToClinicalDataMap:{[sampleId:string]:ClinicalData[]}|undefined, sampleManager:SampleManager) {
        const sampleId:string = mutation.sampleId;
        const componentBySample = sampleManager.getComponentForSample(sampleId, 1, "");
        let wgd = getWGD(sampleIdToClinicalDataMap, sampleId);
        if (!hasASCNProperty(mutation, "totalCopyNmber") || 
            !hasASCNProperty(mutation, "minorCopyNumber") || 
            !hasASCNProperty(mutation, "ascnIntegerCopyNumber") || 
            wgd === null) {
            return (<span>{componentBySample} <b>NA</b></span>);
        }
        const tcn = mutation.alleleSpecificCopyNumber.totalCopyNumber;
        const lcn = mutation.alleleSpecificCopyNumber.minorCopyNumber;
        const mcn:number = tcn - lcn;
        let ascnTooltip = getAscnCall(mcn, lcn, wgd).toLowerCase()
        return (
            <span>
                {componentBySample} <b>{ascnTooltip}</b> ({wgd} with total copy number of {tcn.toString(10)} and a minor copy number of {lcn.toString(10)})
            </span>
        );
    }

    public static renderFunction(data: Mutation[], sampleIdToClinicalDataMap: {[key: string]:ClinicalData[]}|undefined, sampleIds:string[], sampleManager:SampleManager|null) {
        if (!sampleManager) {
            return <span />;
        }
        const displayValuesBySample:{[key:string]:JSX.Element} = PatientASCNCopyNumberColumnFormatter.getElementsForMutations(data, sampleIdToClinicalDataMap, sampleManager);
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
                // if current item is not last sample in list, separate with space
                if (sampleIdsWithElements.indexOf(sampleId) !== (sampleIdsWithElements.length -1)) {
                    return <li>{displayElement}<span style={{fontSize:"small"}}> </span></li>;
                }
                return <li>{displayElement}</li>;
            })
            return (
             <span style={{display:'inline-block', minWidth:100, position:'relative'}}>
                 <ul style={{marginBottom:0}} className="list-inline list-unstyled">{ content }</ul>
             </span>
            );
        }
    }

    public static getElementsForMutations(data:Mutation[], sampleIdToClinicalDataMap: {[key: string]:ClinicalData[]}|undefined, sampleManager:SampleManager) {
        const sampleToElement:{[key: string]: JSX.Element} = {};
        for (const mutation of data) {
            const element = PatientASCNCopyNumberColumnFormatter.getElement(mutation, sampleIdToClinicalDataMap, sampleManager);
            sampleToElement[mutation.sampleId] = element;
        }
        return sampleToElement;
    }

    public static getElement(mutation:Mutation, sampleIdToClinicalDataMap: {[key: string]:ClinicalData[]}|undefined, sampleManager:SampleManager) {
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
        const cnaToolTip = PatientASCNCopyNumberColumnFormatter.getASCNCopyNumberTooltip(mutation, sampleIdToClinicalDataMap, sampleManager);
        return <DefaultTooltip placement="left"
                    overlay={cnaToolTip}
                    arrowContent={<div className="rc-tooltip-arrow-inner"/>}
                >
                    {cnaIconElement}
                </DefaultTooltip>;
    }


}
