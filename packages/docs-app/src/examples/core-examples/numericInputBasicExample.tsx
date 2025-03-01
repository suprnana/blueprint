/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";

import {
    Button,
    Divider,
    FormGroup,
    H5,
    HTMLSelect,
    Intent,
    Menu,
    MenuItem,
    NumericInput,
    type NumericInputProps,
    type OptionProps,
    Popover,
    Position,
    Switch,
} from "@blueprintjs/core";
import {
    Example,
    type ExampleProps,
    handleBooleanChange,
    handleNumberChange,
    handleStringChange,
    handleValueChange,
} from "@blueprintjs/docs-theme";
import { IconNames } from "@blueprintjs/icons";

import { IntentSelect } from "./common/intentSelect";
import { LOCALES } from "./common/locales";

const MIN_VALUES = [
    { label: "None", value: -Infinity },
    { label: "-10", value: -10 },
    { label: "0", value: 0 },
    { label: "20", value: 20 },
];

const MAX_VALUES = [
    { label: "None", value: +Infinity },
    { label: "20", value: 20 },
    { label: "50", value: 50 },
    { label: "100", value: 100 },
];

const BUTTON_POSITIONS = [
    { label: "None", value: "none" },
    { label: "Left", value: Position.LEFT },
    { label: "Right", value: Position.RIGHT },
];

export class NumericInputBasicExample extends React.PureComponent<ExampleProps, NumericInputProps> {
    public state: NumericInputProps = {
        allowNumericCharactersOnly: true,
        buttonPosition: "right",
        disabled: false,
        fill: false,
        intent: Intent.NONE,
        large: false,
        majorStepSize: 10,
        max: 100,
        min: 0,
        minorStepSize: 0.1,
        selectAllOnFocus: false,
        selectAllOnIncrement: false,
        small: false,
        stepSize: 1,
        value: "",
    };

    private handleMaxChange = handleNumberChange(max => this.setState({ max }));

    private handleMinChange = handleNumberChange(min => this.setState({ min }));

    private handleIntentChange = (intent: Intent) => this.setState({ intent });

    private handleButtonPositionChange = handleValueChange((buttonPosition: NumericInputProps["buttonPosition"]) =>
        this.setState({ buttonPosition }),
    );

    private handleLocaleChange = handleStringChange(locale =>
        this.setState({ locale: locale === "default" ? undefined : locale }),
    );

    private toggleDisabled = handleBooleanChange(disabled => this.setState({ disabled }));

    private toggleLeftIcon = handleBooleanChange(leftIcon =>
        this.setState({ leftIcon: leftIcon ? "dollar" : undefined }),
    );

    private handleSmallChange = handleBooleanChange(small => this.setState({ small, ...(small && { large: false }) }));

    private handleLargeChange = handleBooleanChange(large => this.setState({ large, ...(large && { small: false }) }));

    private toggleLeftElement = handleBooleanChange(leftElement =>
        this.setState({
            leftElement: leftElement ? (
                <Popover
                    position="bottom"
                    content={
                        <Menu>
                            <MenuItem icon={IconNames.Equals} text={"Equals"} />
                            <MenuItem icon={IconNames.LessThan} text={"Less than"} />
                            <MenuItem icon={IconNames.GreaterThan} text={"Greater than"} />
                        </Menu>
                    }
                >
                    <Button minimal={true} icon={IconNames.Filter} />
                </Popover>
            ) : undefined,
        }),
    );

    private toggleFullWidth = handleBooleanChange(fill => this.setState({ fill }));

    private toggleNumericCharsOnly = handleBooleanChange(allowNumericCharactersOnly =>
        this.setState({ allowNumericCharactersOnly }),
    );

    private toggleSelectAllOnFocus = handleBooleanChange(selectAllOnFocus => this.setState({ selectAllOnFocus }));

    private toggleSelectAllOnIncrement = handleBooleanChange(selectAllOnIncrement => {
        this.setState({ selectAllOnIncrement });
    });

    public render() {
        return (
            <Example options={this.renderOptions()} {...this.props}>
                <NumericInput {...this.state} placeholder="Enter a number..." onValueChange={this.handleValueChange} />
            </Example>
        );
    }

    protected renderOptions() {
        const {
            buttonPosition,
            intent,
            max,
            min,
            allowNumericCharactersOnly,
            selectAllOnFocus,
            selectAllOnIncrement,
            disabled,
            fill,
            large,
            leftIcon,
            leftElement,
            locale,
            small,
        } = this.state;

        return (
            <>
                <H5>Props</H5>
                {this.renderSwitch("Disabled", disabled, this.toggleDisabled)}
                {this.renderSwitch("Fill", fill, this.toggleFullWidth)}
                {this.renderSwitch("Large", large, this.handleLargeChange)}
                {this.renderSwitch("Small", small, this.handleSmallChange)}
                {this.renderSwitch("Left icon", leftIcon != null, this.toggleLeftIcon)}
                {this.renderSwitch("Left element", leftElement != null, this.toggleLeftElement)}
                {this.renderSwitch("Numeric characters only", allowNumericCharactersOnly, this.toggleNumericCharsOnly)}
                {this.renderSwitch("Select all on focus", selectAllOnFocus, this.toggleSelectAllOnFocus)}
                {this.renderSwitch("Select all on increment", selectAllOnIncrement, this.toggleSelectAllOnIncrement)}
                <Divider />
                {this.renderSelectMenu("Minimum value", min, MIN_VALUES, this.handleMinChange)}
                {this.renderSelectMenu("Maximum value", max, MAX_VALUES, this.handleMaxChange)}
                {this.renderSelectMenu(
                    "Button position",
                    buttonPosition,
                    BUTTON_POSITIONS,
                    this.handleButtonPositionChange,
                )}
                <IntentSelect intent={intent} onChange={this.handleIntentChange} />
                {this.renderSelectMenu(
                    "Locale",
                    locale,
                    [{ label: "Default", value: "default" }, ...LOCALES],
                    this.handleLocaleChange,
                )}
            </>
        );
    }

    private renderSwitch(label: string, checked: boolean, onChange: React.FormEventHandler<HTMLElement>) {
        return <Switch checked={checked} label={label} onChange={onChange} />;
    }

    private renderSelectMenu(
        label: string,
        value: number | string,
        options: OptionProps[],
        onChange: React.FormEventHandler,
    ) {
        return (
            <FormGroup label={label}>
                <HTMLSelect {...{ value, onChange, options }} />
            </FormGroup>
        );
    }

    private handleValueChange = (_v: number, value: string) => this.setState({ value });
}
