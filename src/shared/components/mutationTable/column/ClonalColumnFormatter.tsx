import * as React from 'react';
import DefaultTooltip from 'shared/components/defaultTooltip/DefaultTooltip';
import {Mutation} from "shared/api/generated/CBioPortalAPI";
import styles from "./mutationType.module.scss";
import getCanonicalMutationType from "shared/lib/getCanonicalMutationType";

interface IMutationTypeFormat {
    label?: string;
    longName?: string;
    className: string;
    mainType: string;
    priority?: number;
}

/**
 * @author Selcuk Onur Sumer
 */
export default class ClonalColumnFormatter
{
    /* Determines the display value by using the impact field.
     *
     * @param data  column formatter data
     * @returns {string}    mutation assessor text value
     */
    public static getDisplayValue(data:Mutation[]):string
    {
        return ClonalColumnFormatter.getClonalValue(data);
    }

    public static getCcfMCopiesUpperValue(data:Mutation[]):number
    {
        const ccfMCopiesUpper = data[0].ccfMCopiesUpper;
        return ccfMCopiesUpper;
    }

    public static getCcfMCopiesValue(data:Mutation[]):number
    {
        const ccfMCopies = data[0].ccfMCopies;
        return ccfMCopies;
    }

    public static getClonalValue(data:Mutation[]):string
    {
        let textValue:string = "";
        const dataValue = ClonalColumnFormatter.getCcfMCopiesUpperValue(data);
        if (dataValue === 1) {
            textValue = "True";
        } else {
            textValue = "False";
        }
        return textValue;
    }

    public static getTextValue(data:number):string
    {
        let textValue:string = "";
        
        if (data) {
            textValue = data.toString(10);
        }
        
        return textValue;
    }

    public static renderFunction(data:Mutation[])
    {
        // use text for all purposes (display, sort, filter)
        const text:string = ClonalColumnFormatter.getDisplayValue(data);

        // use actual value for tooltip
        const toolTip:string = ClonalColumnFormatter.getTextValue(ClonalColumnFormatter.getCcfMCopiesValue(data));

        let content = <span>{text}</span>;

        // add tooltip only if the display value differs from the actual text value!
        if (toolTip.toLowerCase() !== text.toLowerCase())
        {
            const arrowContent = <div className="rc-tooltip-arrow-inner"/>;

            content = (
                <DefaultTooltip overlay={<span>{toolTip}</span>} placement="left" arrowContent={arrowContent}>
                    {content}
                </DefaultTooltip>
            );
        }

        return content;
    }
}

