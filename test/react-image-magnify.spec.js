import React from 'react';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import ReactImageMagnify from '../src/ReactImageMagnify';

describe('React Image Magnify', () => {
    const smallImage = {
        alt: 'baz',
        isFluidWidth: false,
        src: 'qux',
        srcSet: 'quux',
        sizes: 'grault',
        width: 3,
        height: 4
    };
    const largeImage = {
        alt: 'foo',
        src: 'bar',
        srcSet: 'corge',
        sizes: 'garply',
        width: 12,
        height: 16
    };

    function getCompositProps(props) {
        return Object.assign(
            {
                fadeDurationInMs: 0,
                hoverDelayInMs: 0,
                hoverOffDelayInMs: 0
            },
            {
                largeImage,
                smallImage
            },
            props
        );
    }

    function getShallowWrapper(props) {
        return shallow(
            <ReactImageMagnify {...getCompositProps(props)} />
        );
    }

    function getMountedWrapper(props) {
        return mount(
            <ReactImageMagnify {...getCompositProps(props)} />
        );
    }

    function simulateWindowResize() {
        var event = new MouseEvent('resize', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });

        window.dispatchEvent(event);
    }

    let shallowWrapper = getShallowWrapper();

    beforeEach(() => {
        shallowWrapper = getShallowWrapper();
    });

    it('has correct default props', () => {
        expect(ReactImageMagnify.defaultProps).to.deep.equal({
            fadeDurationInMs: 300,
            hoverDelayInMs: 250,
            hoverOffDelayInMs: 150
        });
    });

    it('sets initial smallImageWidth and smallImageHeight state to zero', () => {
        const instance = shallowWrapper.instance();
        const state = instance.state;

        expect(state.smallImageWidth).to.equal(0);
        expect(state.smallImageHeight).to.equal(0);
    });

    it('sets fluid small image dimensions state on small image load', () => {
        const mountedWrapper = getMountedWrapper({
            smallImage: Object.assign(
                {},
                smallImage,
                { isFluidWidth: true }
            )
        });
        const instance = mountedWrapper.instance();
        sinon.spy(instance, 'setSmallImageDimensionState');

        instance.onSmallImageLoad();

        expect(instance.setSmallImageDimensionState.called).to.be.true;
        instance.setSmallImageDimensionState.restore();
    });

    it('does not set fixed small image dimensions state on small image load', () => {
        const mountedWrapper = getMountedWrapper();
        const instance = mountedWrapper.instance();
        sinon.spy(instance, 'setSmallImageDimensionState');

        instance.onSmallImageLoad();

        expect(instance.setSmallImageDimensionState.called).to.be.false;
        instance.setSmallImageDimensionState.restore();
    });

    it('sets environment state when onDetectedEnvironmentChanged is called', () => {
        const mountedWrapper = getMountedWrapper();
        const instance = mountedWrapper.instance();
        const detectedEnvironment = { isTouchDetected: true, isMouseDetected: false };

        instance.onDetectedEnvironmentChanged(detectedEnvironment);

        expect(mountedWrapper.state('detectedEnvironment')).to.deep.equal(detectedEnvironment);
    });

    it('sets isActive state when onActivationChanged is called', () => {
        const instance = shallowWrapper.instance();

        instance.onActivationChanged({ isActive: true });

        expect(shallowWrapper.state('isActive')).to.be.true;
    });

    describe('Props API', () => {

        it('applies className to root component', () => {
            shallowWrapper.setProps({ className: 'foo' });

            expect(shallowWrapper.find('ReactCursorPosition').props().className).to.equal('foo');
        });

        describe('style', () => {
            it('applies style to root component', () => {
                shallowWrapper.setProps({ style: { color: 'red' } });

                expect(shallowWrapper.find('ReactCursorPosition').props().style.color).to.equal('red');
            });

            it('prioritizes required fluid root component style over user specified style', () => {
                const props = {
                    style: {
                        width: '1px',
                        fontSize: '2px',
                        position: 'absolute'
                    },
                    smallImage: Object.assign(
                        {},
                        smallImage,
                        { isFluidWidth: true }
                    )
                };
                shallowWrapper.setProps(props);

                // Root component renders the root container element
                const { style } = shallowWrapper.find('ReactCursorPosition').props();
                expect(style.width).to.equal('auto');
                expect(style.height).to.equal('auto');
                expect(style.fontSize).to.equal('0px');
                expect(style.position).to.equal('relative');
            });

            it('prioritizes required fixed width root component style over user specified style', () => {
                const props = {
                    style: {
                        width: '1px',
                        height: '2px',
                        position: 'absolute'
                    }
                };
                shallowWrapper.setProps(props);

                // Root component renders the root container element
                const { style } = shallowWrapper.find('ReactCursorPosition').props();
                expect(style.width).to.equal('3px');
                expect(style.height).to.equal('4px');
                expect(style.position).to.equal('relative');
            });
        });

        it('applies hoverDelayInMs to ReactHoverObserver component', () => {
            shallowWrapper.setProps({ hoverDelayInMs: 1 });

            expect(shallowWrapper.find('ReactCursorPosition').props().hoverDelayInMs).to.equal(1);
        });

        it('applies hoverOffDelayInMs to ReactHoverObserver component', () => {
            shallowWrapper.setProps({ hoverOffDelayInMs: 2 });

            expect(shallowWrapper.find('ReactCursorPosition').props().hoverOffDelayInMs).to.equal(2);
        });

        it('applies imageClassName to small image element', () => {
            shallowWrapper.setProps({ imageClassName: 'baz' });

            expect(shallowWrapper.find('img').hasClass('baz')).to.be.true;
        });

        describe('imageStyle', () => {
            it('applies imageStyle to small image element', () => {
                shallowWrapper.setProps({ imageStyle: { color: 'green' } });

                expect(shallowWrapper.find('img').props().style.color).to.equal('green');
            });

            it('prioritizes required fixed width style over user specified style', () => {
                shallowWrapper.setProps({
                    imageStyle: {
                        width: '10px',
                        height: '11px'
                    }
                });

                const { style } = shallowWrapper.find('img').props();
                expect(style.width).to.equal('3px');
                expect(style.height).to.equal('4px');
            });

            it('prioritizes required fluid width style over user specified style', () => {
                shallowWrapper.setProps({
                    imageStyle: {
                        width: '10px',
                        height: '11px',
                        display: 'inline-block'
                    },
                    smallImage: Object.assign(
                        {},
                        smallImage,
                        {
                            isFluidWidth: true
                        }
                    )
                });

                const { style } = shallowWrapper.find('img').props();
                expect(style.width).to.equal('100%');
                expect(style.height).to.equal('auto');
                expect(style.display).to.equal('block');
            });

        });

        describe('smallImage', () => {
            it('applies fixed width dimensions to root element', () => {
                const { style } = shallowWrapper.find('ReactCursorPosition').props();

                expect(style.width).to.equal('3px');
                expect(style.height).to.equal('4px');
            });

            it('does not apply fixed width dimensions to root element, in the fluid scenario', () => {
                shallowWrapper.setProps({
                    smallImage: {
                        isFluidWidth: true,
                        src: 'foo'
                    }
                });
                const { style } = shallowWrapper.find('ReactCursorPosition').props();

                expect(style.width).to.equal('auto');
                expect(style.height).to.equal('auto');
            });

            it('applies fixed width smallImage values to small image element', () => {
                const { alt, src, srcSet, sizes, style } = shallowWrapper.find('img').props();

                expect(alt).to.equal(smallImage.alt);
                expect(src).to.equal(smallImage.src);
                expect(srcSet).to.equal(smallImage.srcSet);
                expect(sizes).to.equal(smallImage.sizes);
                expect(style.width).to.equal(smallImage.width + 'px');
                expect(style.height).to.equal(smallImage.height + 'px');
            });

            it('applies fluid width smallImage values to small image element', () => {
                shallowWrapper.setProps({
                    smallImage: Object.assign(
                        {},
                        smallImage,
                        {
                            isFluidWidth: true
                        }
                    )
                });

                const { alt, src, srcSet, sizes, style } = shallowWrapper.find('img').props();
                expect(alt).to.equal(smallImage.alt);
                expect(src).to.equal(smallImage.src);
                expect(srcSet).to.equal(smallImage.srcSet);
                expect(sizes).to.equal(smallImage.sizes);
                expect(style.width).to.equal('100%');
                expect(style.height).to.equal('auto');
            });

            it('provides fixed width smallImage to lens component', () => {
                shallowWrapper
                    .setProps({ fadeDurationInMs: 1 })
                    .setState({ isTouchDetected: false });

                expect(shallowWrapper.find('ImageLensShaded').props().smallImage).to.deep.equal(smallImage);
            });

            it('provides fluid width smallImage to lens component', () => {
                shallowWrapper.setProps({
                    fadeDurationInMs: 1,
                    smallImage: Object.assign(
                        {},
                        smallImage,
                        {
                            isFluidWidth: true,
                        }
                    )
                });
                shallowWrapper.setState({ isTouchDetected: false })

                const expected = Object.assign(
                    {},
                    smallImage,
                    {
                        isFluidWidth: true,
                        width: 0,
                        height: 0
                    }
                );
                expect(shallowWrapper.find('ImageLensShaded').props().smallImage).to.deep.equal(expected);
            });

            it('provides fixed width smallImage to EnlargedImage component', () => {
                expect(shallowWrapper.find('EnlargedImage').props().smallImage).to.deep.equal(smallImage);
            });

            it('provides fluid width smallImage to EnlargedImage component', () => {
                shallowWrapper.setProps({
                    smallImage: Object.assign(
                        {},
                        smallImage,
                        {
                            isFluidWidth: true
                        }
                    )
                });

                const expected = Object.assign(
                    {},
                    smallImage,
                    {
                        isFluidWidth: true,
                        width: 0,
                        height: 0
                    }
                );
                expect(shallowWrapper.find('EnlargedImage').props().smallImage).to.deep.equal(expected);
            });

            describe('isFluidWidth', () => {
                it('applies fluid width style to container element, when set', () => {
                    shallowWrapper.setProps({
                        smallImage: {
                            isFluidWidth: true,
                            src: 'foo'
                        }
                    });
                    const { style } = shallowWrapper.find('ReactCursorPosition').props();

                    expect(style.width).to.equal('auto');
                    expect(style.height).to.equal('auto');
                });

                it('applies fluid width style to small image element, when set', () => {
                    shallowWrapper.setProps({
                        smallImage: {
                            isFluidWidth: true,
                            src: 'foo'
                        }
                    });
                    const { style } = shallowWrapper.find('img').props();

                    expect(style.width).to.equal('100%');
                    expect(style.height).to.equal('auto');
                });

                it('sets smallImageWidth and smallImageHeight state with offset values, when component mounts', () => {
                    shallowWrapper.setProps({
                        smallImage: {
                            isFluidWidth: true,
                            src: 'foo'
                        }
                    });
                    const instance = shallowWrapper.instance();
                    instance.smallImageEl = {
                        offsetWidth: 10,
                        offsetHeight: 20
                    }

                    instance.componentDidMount();

                    expect(shallowWrapper.state().smallImageWidth).to.equal(10);
                    expect(shallowWrapper.state().smallImageHeight).to.equal(20);
                });

                it('listens for window resize event on mount', () => {
                    sinon.spy(window, 'addEventListener');

                    getMountedWrapper({
                        smallImage: {
                            isFluidWidth: true,
                            src: 'foo'
                        }
                    });

                    expect(window.addEventListener.calledWith('resize')).to.be.true;
                    window.addEventListener.restore();
                });

                it('removes window resize listener when unmounted', () => {
                    sinon.spy(window, 'removeEventListener');
                    const mountedWrapper = getMountedWrapper({
                        smallImage: {
                            isFluidWidth: true,
                            src: 'foo'
                        }
                    });
                    mountedWrapper.unmount();

                    expect(window.removeEventListener.calledWith('resize')).to.be.true;
                    window.removeEventListener.restore();
                });

                it('does not listen for window resize event when isFluidWidthSmallImage is not set', () => {
                    sinon.spy(window, 'addEventListener');

                    getMountedWrapper();

                    expect(window.addEventListener.calledWith('resize')).to.be.false;
                    window.addEventListener.restore();
                });

                it('sets small image offset height and width state when the browser is resized', () => {
                    const mountedWrapper = getMountedWrapper({
                        smallImage: {
                            isFluidWidth: true,
                            src: 'foo'
                        }
                    });
                    const instance = mountedWrapper.instance();
                    instance.smallImageEl = {
                        offsetWidth: 50,
                        offsetHeight: 51
                    };

                    simulateWindowResize();

                    expect(mountedWrapper.state('smallImageWidth')).to.equal(50);
                    expect(mountedWrapper.state('smallImageHeight')).to.equal(51);
                });
            });
        });

        it('applies fadeDurationInMs to lens component', () => {
            shallowWrapper
                .setProps({ fadeDurationInMs: 1 })
                .setState({ isTouchDetected: false });

            expect(shallowWrapper.find('ImageLensShaded').props().fadeDurationInMs).to.deep.equal(1);
        });

        it('applies enlargedImageContainerClassName to EnlargedImage component', () => {
            shallowWrapper.setProps({ enlargedImageContainerClassName: 'foo' });

            expect(shallowWrapper.find('EnlargedImage').props().containerClassName).to.equal('foo');
        });

        it('applies enlargedImageContainerStyle to EnlargedImage component', () => {
            const style = { color: 'red' };
            shallowWrapper.setProps({ enlargedImageContainerStyle: style });

            expect(shallowWrapper.find('EnlargedImage').props().containerStyle).to.equal(style);
        });

        it('applies enlargedImageClassName to EnlargedImage component', () => {
            shallowWrapper.setProps({ enlargedImageClassName: 'bar' });

            expect(shallowWrapper.find('EnlargedImage').props().imageClassName).to.equal('bar');
        });

        it('applies enlargedImageStyle to EnlargedImage component', () => {
            const style = { color: 'blue' };
            shallowWrapper.setProps({ enlargedImageStyle: style });

            expect(shallowWrapper.find('EnlargedImage').props().imageStyle.color).to.equal('blue');
        });

        it('applies fadeDurationInMs to EnlargedImage component', () => {
            shallowWrapper.setProps({ fadeDurationInMs: 1 });

            expect(shallowWrapper.find('EnlargedImage').props().fadeDurationInMs).to.equal(1);
        });

        it('applies largeImage to EnlargedImage component', () => {
            expect(shallowWrapper.find('EnlargedImage').props().largeImage).to.equal(largeImage);
        });

        it('applies enlargedImagePosition to EnlargedImage component', () => {
            shallowWrapper.setProps({ enlargedImagePosition: 'over' });

            expect(shallowWrapper.find('EnlargedImage').props().imagePosition).to.equal('over');
        });
    });
});
