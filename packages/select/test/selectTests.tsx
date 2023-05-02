/*
 * Copyright 2022 Palantir Technologies, Inc. All rights reserved.
 *
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

import { assert } from "chai";
import { mount } from "enzyme";
import * as React from "react";
import * as sinon from "sinon";

import { Classes as CoreClasses, InputGroup, MenuItem, Popover } from "@blueprintjs/core";

import { ItemRendererProps, Select, SelectProps, SelectState } from "../src";
import { Film, renderFilm, TOP_100_FILMS } from "../src/__examples__";
import { selectComponentSuite } from "./selectComponentSuite";
import { selectPopoverTestSuite } from "./selectPopoverTestSuite";

describe("<Select>", () => {
    const defaultProps = {
        items: TOP_100_FILMS,
        popoverProps: { isOpen: true, usePortal: false },
        query: "",
    };
    let handlers: {
        itemPredicate: sinon.SinonSpy<[string, Film], boolean>;
        itemRenderer: sinon.SinonSpy<[Film, ItemRendererProps], JSX.Element | null>;
        onItemSelect: sinon.SinonSpy;
    };
    let testsContainerElement: HTMLElement | undefined;

    beforeEach(() => {
        handlers = {
            itemPredicate: sinon.spy(filterByYear),
            itemRenderer: sinon.spy(renderFilm),
            onItemSelect: sinon.spy(),
        };
        testsContainerElement = document.createElement("div");
        document.body.appendChild(testsContainerElement);
    });

    afterEach(() => {
        for (const spy of Object.values(handlers)) {
            spy.resetHistory();
        }
        testsContainerElement?.remove();
    });

    selectComponentSuite<SelectProps<Film>, SelectState>(props =>
        mount(<Select {...props} popoverProps={{ isOpen: true, usePortal: false }} />),
    );

    selectPopoverTestSuite<SelectProps<Film>, SelectState>(props =>
        mount(<Select {...props} />, { attachTo: testsContainerElement }),
    );

    it("renders a Popover around children that contains InputGroup and items", () => {
        const wrapper = select();
        assert.lengthOf(wrapper.find(InputGroup), 1, "should render InputGroup");
        assert.lengthOf(wrapper.find(Popover), 1, "should render Popover");
    });

    it("filterable=false hides InputGroup", () => {
        const wrapper = select({ filterable: false });
        assert.lengthOf(wrapper.find(InputGroup), 0, "should not render InputGroup");
        assert.lengthOf(wrapper.find(Popover), 1, "should render Popover");
    });

    it("disabled=true disables Popover", () => {
        const wrapper = select({ disabled: true });
        assert.strictEqual(wrapper.find(Popover).prop("disabled"), true);
    });

    it("disabled=true doesn't call itemRenderer", () => {
        select({ disabled: true });
        assert.equal(handlers.itemRenderer.callCount, 0);
    });

    it("disabled=false calls itemRenderer", () => {
        select({ disabled: false });
        assert.equal(handlers.itemRenderer.callCount, 100);
    });

    it("inputProps value and onChange are ignored", () => {
        const inputProps = { value: "nailed it", onChange: sinon.spy() };
        // @ts-expect-error - value and onChange are now omitted from the props type
        const input = select({ inputProps }).find("input");
        assert.notEqual(input.prop("onChange"), inputProps.onChange);
        assert.notEqual(input.prop("value"), inputProps.value);
    });

    it("Popover can be controlled with popoverProps", () => {
        // Select defines its own onOpening so this ensures that the passthrough happens
        const onOpening = sinon.spy();
        const modifiers = {}; // our own instance
        const wrapper = select({ popoverProps: { onOpening, modifiers } });
        wrapper.find("[data-testid='target-button']").simulate("click");
        assert.strictEqual(wrapper.find(Popover).prop("modifiers"), modifiers);
        assert.isTrue(onOpening.calledOnce);
    });

    // TODO(adahiya): move into selectComponentSuite, generalize for Suggest & MultiSelect
    it("opens Popover when arrow key pressed on target while closed", () => {
        // override isOpen in defaultProps
        const wrapper = select({ popoverProps: { usePortal: false } });
        // should be closed to start
        assert.strictEqual(wrapper.find(Popover).prop("isOpen"), false);
        wrapper.find("[data-testid='target-button']").simulate("keydown", { key: "ArrowDown" });
        // ...then open after key down
        assert.strictEqual(wrapper.find(Popover).prop("isOpen"), true);
    });

    // HACKHACK: see https://github.com/palantir/blueprint/issues/5364
    it.skip("invokes onItemSelect when clicking first MenuItem", () => {
        const wrapper = select();
        wrapper.find(Popover).find(MenuItem).first().simulate("click");
        assert.isTrue(handlers.onItemSelect.calledOnce);
    });

    it("closes the popover when selecting first menu item", () => {
        const itemRenderer = (film: Film) => {
            return <MenuItem text={`${film.rank}. ${film.title}`} shouldDismissPopover={true} />;
        };
        const wrapper = select({ itemRenderer, popoverProps: { usePortal: false } });

        // popover should start closed
        assert.strictEqual(wrapper.find(Popover).prop("isOpen"), false);

        // popover should open after clicking the button
        wrapper.find("[data-testid='target-button']").simulate("click");
        assert.strictEqual(wrapper.find(Popover).prop("isOpen"), true);

        // and should close after the a menu item is clicked
        wrapper.find(Popover).find(`.${CoreClasses.MENU_ITEM}`).first().simulate("click");
        assert.strictEqual(wrapper.find(Popover).prop("isOpen"), false);
    });

    it("does not close the popover when selecting a menu item with shouldDismissPopover", () => {
        const itemRenderer = (film: Film) => {
            return <MenuItem text={`${film.rank}. ${film.title}`} shouldDismissPopover={false} />;
        };
        const wrapper = select({ itemRenderer, popoverProps: { usePortal: false } });

        // popover should start closed
        assert.strictEqual(wrapper.find(Popover).prop("isOpen"), false);

        // popover should open after clicking the button
        wrapper.find("[data-testid='target-button']").simulate("click");
        assert.strictEqual(wrapper.find(Popover).prop("isOpen"), true);

        // and should not close after the a menu item is clicked
        wrapper.find(Popover).find(`.${CoreClasses.MENU_ITEM}`).first().simulate("click");
        assert.strictEqual(wrapper.find(Popover).prop("isOpen"), true);
    });

    function select(props: Partial<SelectProps<Film>> = {}, query?: string) {
        const wrapper = mount(
            <Select<Film> {...defaultProps} {...handlers} {...props}>
                <button data-testid="target-button">Target</button>
            </Select>,
        );
        if (query !== undefined) {
            wrapper.setState({ query });
        }
        return wrapper;
    }
});

function filterByYear(query: string, film: Film) {
    return query === "" || film.year.toString() === query;
}
