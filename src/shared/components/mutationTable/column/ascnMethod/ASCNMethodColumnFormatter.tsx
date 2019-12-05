import * as React from 'react';
import {Mutation} from "shared/api/generated/CBioPortalAPI";
import {hasASCNProperty} from "shared/lib/MutationUtils";
import SampleManager from "pages/patientView/SampleManager";

/**
 * @author Avery Wang
 */

function getASCNMethodValue(mutation: Mutation): string {
    return hasASCNProperty(mutation, "ascnMethod") ? mutation.alleleSpecificCopyNumber.ascnMethod : "";
}

export const getDefaultASCNMethodColumnDefinition = () => {
    return {
        name: "ASCN Method",
        tooltip: (<span>Allele Specific Copy Number Method</span>),
        render: (d: Mutation[]) => ASCNMethodColumnFormatter.renderFunction(d),
        sortBy: (d: Mutation[]) => getASCNMethodValue(d[0]),
        download: (d: Mutation[]) => ASCNMethodColumnFormatter.getASCNMethodDownload(d)
    }
};


export default class ASCNMethodColumnFormatter {

    /* Determines the display value by using the impact field.
     *
     * @param data  column formatter data
     * @returns {string}"ASCNMethod" text value
     */
    public static renderFunction(data: Mutation[]) {
        return (
            <>
                <span>
                    {getASCNMethodValue(data[0])}
                </span>
            </>
        );
    }

    public static getASCNMethodDownload(mutations: Mutation[]): string[] {
        return mutations.map(mutation=>getASCNMethodValue(mutation));
    }
}
