import * as React from 'react';
import {ClonalValue} from "shared/components/mutationTable/column/clonal/ClonalColumnFormatter";
import ClonalColumnFormatter from "shared/components/mutationTable/column/clonal/ClonalColumnFormatter";
import {ClinicalData} from "shared/api/generated/CBioPortalAPI";
import {Mutation} from "shared/api/generated/CBioPortalAPI";
import {hasASCNProperty} from "shared/lib/MutationUtils";
import SampleManager from "pages/patientView/SampleManager";
import ASCNCopyNumberElement from "shared/components/mutationTable/column/ascnCopyNumber/ASCNCopyNumberElement";

/**
 * @author Avery Wang
 */

// gets value displayed in table cell - "NA" if missing attributes needed for calculation
function getAscnCopyNumberData(mutation:Mutation, sampleIdToClinicalDataMap:{[sampleId:string]:ClinicalData[]}|undefined) {
    return hasASCNProperty(mutation, "ascnIntegerCopyNumber") ? mutation.alleleSpecificCopyNumber.ascnIntegerCopyNumber : "NA";
}

// sort by total copy number (since that is the number displayed in the icon
function getAllTotalCopyNumberForMutation(data:Mutation[], sampleIdToClinicalDataMap: {[key: string]:ClinicalData[]}|undefined, sampleIds:string[]) {
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

function getSortValue(data:Mutation[], sampleIdToClinicalDataMap: {[key: string]:ClinicalData[]}|undefined, sampleIds:string[]) {
    const displayValuesBySample:{[key: string]: string} = getAllTotalCopyNumberForMutation(data, sampleIdToClinicalDataMap, sampleIds);
    const sampleIdsWithValues = sampleIds.filter(sampleId => displayValuesBySample[sampleId]);
    const displayValuesAsString = sampleIdsWithValues.map((sampleId:string) => {
        return displayValuesBySample[sampleId];
    })
    return displayValuesAsString.join(";");
}

function getClonalValue(mutation: Mutation): ClonalValue {
    let textValue: ClonalValue = ClonalValue.NA;
    if (hasASCNProperty(mutation, "clonal")) {
        textValue = mutation.alleleSpecificCopyNumber.clonal ? ClonalValue.YES : ClonalValue.NO;
    }
    return textValue;
}

export function getWGD(sampleIdToClinicalDataMap:{[sampleId:string]:ClinicalData[]}|undefined, sampleId:string) {
    let wgdData = sampleIdToClinicalDataMap ?  
        sampleIdToClinicalDataMap[sampleId].filter((cd: ClinicalData) => cd.clinicalAttributeId === "FACETS_WGD") : undefined;
    return (wgdData !== undefined && wgdData.length > 0) ? wgdData[0].value : "NA"; 
}

export const getDefaultASCNCopyNumberColumnDefinition = (sampleIds?: string[], sampleIdToClinicalDataMap?:{[sampleId:string]:ClinicalData[]}, sampleManager?: SampleManager) => {
    return {
        name: "Integer Copy #",
        render: (d: Mutation[]) => ASCNCopyNumberColumnFormatter.renderFunction(d, sampleIdToClinicalDataMap, sampleIds ? sampleIds : (d.length > 0 ? [d[0].sampleId] : []), sampleManager),
        sortBy:(d:Mutation[]) => getSortValue(d, this.props.sampleIdToClinicalDataMap, this.getSamples()),
        download: (d: Mutation[]) => ClonalColumnFormatter.getClonalDownload(d)
    }
};


export default class ASCNCopyNumberColumnFormatter {

    /* Determines the display value by using the impact field.
     *
     * @param data  column formatter data
     * @returns {string}"Clonal" text value
     */
    public static renderFunction(data: Mutation[], sampleIdToClinicalDataMap?:{[sampleId:string]:ClinicalData[]}, sampleIds: string[], sampleManager?: SampleManager) {
        const sampleToTotalCopyNumber: { [key: string]: string } = {};
        const sampleToMinorCopyNumber: { [key: string]: string } = {};
        const sampleToASCNCopyNumber: { [key: string]: string } = {};

        for (const mutation of data) {
            sampleToTotalCopyNumber[mutation.sampleId] = hasASCNProperty(mutation, "totalCopyNumber") ? 
                mutation.alleleSpecificCopyNumber.totalCopyNumber.toString() : "NA";
            sampleToMinorCopyNumber[mutation.sampleId] = hasASCNProperty(mutation, "minorCopyNumber") ? 
                mutation.alleleSpecificCopyNumber.minorCopyNumber.toString() : "NA";
            sampleToASCNCopyNumber[mutation.sampleId] = hasASCNProperty(mutation, "ascnIntegerCopyNumber") ? 
                mutation.alleleSpecificCopyNumber.ascnIntegerCopyNumber.toString() : "NA";
        }

        return (
            <>
                {
                    sampleIds.map((sampleId: string, index: number) => {
                        return (
                            <span style={index === 0 ? undefined : {marginLeft: 5}}>
                                <ASCNCopyNumberElement
                                    sampleId={sampleId}
                                    wgdValue={getWGD(sampleIdToClinicalDataMap, sampleId)}
                                    totalCopyNumberValue={sampleToTotalCopyNumber[sampleId] ? sampleToTotalCopyNumber[sampleId] : "NA"}
                                    minorCopyNumberValue={sampleToMinorCopyNumber[sampleId] ? sampleToMinorCopyNumber[sampleId] : "NA"}
                                    ascnCopyNumberValue={sampleToASCNCopyNumber[sampleId] ? sampleToASCNCopyNumber[sampleId] : "NA"}
                                    sampleManager={sampleManager}
                                />
                            </span>
                        );
                    })
                }
            </>
        );
    }

    public static getClonalDownload(mutations: Mutation[]): string[] {
        return mutations.map(mutation=>getClonalValue(mutation));
    }
}
