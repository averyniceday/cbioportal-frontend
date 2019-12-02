import * as React from 'react';
import {Mutation} from "shared/api/generated/CBioPortalAPI";
import {hasASCNProperty} from "shared/lib/MutationUtils";
import SampleManager from "pages/patientView/SampleManager";
import MutantCopiesElement from "shared/components/mutationTable/column/mutantCopies/MutantCopiesElement";

/**
 * @author Avery Wang
 */


export const getDefaultMutantCopiesColumnDefinition = (sampleIds?: string[], sampleManager?: SampleManager) => {
    return {
        name: "Mutant Copies",
        tooltip: (<span>FACETS Best Guess for Mutant Copies / Total Copies</span>),
        render: (d: Mutation[]) => MutantCopiesColumnFormatter.renderFunction(d, sampleIds ? sampleIds : (d.length > 0 ? [d[0].sampleId] : []), sampleManager),
        sortBy: (d: Mutation[]) => d.map(m => m.alleleSpecificCopyNumber.ccfMCopiesUpper),
        download: (d: Mutation[]) => MutantCopiesColumnFormatter.getClonalDownload(d)
    }
};


export default class MutantCopiesColumnFormatter {

    /* Determines the display value by using the impact field.
     *
     * @param data  column formatter data
     * @returns {string}"Clonal" text value
     */
    public static renderFunction(data: Mutation[], sampleIds: string[], sampleManager?: SampleManager) {
        const sampleToTotalCopyNumber: { [key: string]: string } = {};
        const sampleToMutantCopies: { [key: string]: string } = {}; 
        for (const mutation of data) {
            sampleToTotalCopyNumber[mutation.sampleId] = hasASCNProperty(mutation, "totalCopyNumber") ? 
                mutation.alleleSpecificCopyNumber.totalCopyNumber.toString() : "NA";
        }
        for (const mutation of data) {
            sampleToMutantCopies[mutation.sampleId] = hasASCNProperty(mutation, "mutantCopies") ?
                 mutation.alleleSpecificCopyNumber.mutantCopies.toString() : "NA";
        }
        
        // exclude samples with invalid count value (undefined || emtpy || lte 0)
        const samplesWithValue = sampleIds.filter(sampleId =>
            sampleToTotalCopyNumber[sampleId] &&
            sampleToMutantCopies[sampleId] &&
            sampleToTotalCopyNumber[sampleId] !== "NA" &&
            sampleToMutantCopies[sampleId] !== "NA");

        return (
            <>
                {
                    samplesWithValue.map((sampleId: string, index: number) => {
                        return (
                            <span style={index === 0 ? undefined : {marginLeft: 5}}>
                                <MutantCopiesElement
                                    sampleId={sampleId}
                                    totalCopyNumberValue={sampleToTotalCopyNumber[sampleId]}
                                    mutantCopiesValue={sampleToMutantCopies[sampleId]}
                                    sampleManager={sampleManager}
                                />
                                {index !== (samplesWithValue.length - 1) ? ";" : ""}
                            </span>
                        );
                    })
                }
            </>
        );
    }

    public static getClonalDownload(mutations: Mutation[]): string[] {
        return ["boo"];
    }
}
