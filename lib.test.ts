import { match } from "./lib";

interface A {
  readonly _tag: "A";
  num: number;
}

interface B {
  readonly _tag: "B";
  str: string;
}

type Set = A | B;

describe("match", () => {
  () => {
    // it typechecks

    const m = match<Set>()({
      A: (v) => "1", // typeof v === A
      B: (v) => 1, // typeof v === B
      Unknown: (v) => true, // typeof v === unknown
    })({ _tag: "A", num: 1 });

    type test = typeof m; // string | number | boolean

    const m2 = match<Set>()({
      A: (v) => 1, // typeof v === A
      B: (v) => "lkj", // typeof v === B
      Unknown: (v) => true as unknown, // typeof v === unknown
    })({ _tag: "A", num: 1 });
    type test2 = typeof m2; // unknown, because returntype of Unknown arm

    const m3 = match<Set>()({
      A: (v) => 1, // typeof v === A
      B: (v): any => "lkj", // typeof v === B
      Unknown: (v) => true, // typeof v === unknown
    })({ _tag: "A", num: 1 });
    type _test3 = typeof m3; // any, because returntype of B arm

    // @ts-expect-error missing Unknown arm
    const mError1 = match<Set>()({
      A: (v) => 1, // typeof v === A
      B: (v) => "lkj", // typeof v === B
    })({ _tag: "A", num: 1 });

    // @ts-expect-error missing A arm
    const mError2 = match<Set>()({
      B: (v) => "lkj", // typeof v === B
      Unknown: (v) => true, // typeof v === unknown
    })({ _tag: "A", num: 1 });

    const mError3 = match<Set>()({
      // @ts-expect-error A handler's v mistyped
      A: (v: string) => 1, // typeof v === A
      B: (v) => "lkj", // typeof v === B
      Unknown: (v) => true, // typeof v === unknown
    })({ _tag: "A", num: 1 });
  };

  it("matches", () => {
    expect(
      match<Set>()({
        A: (v) => v.num * 2,
        B: (v) => "Hello " + v.str,
        Unknown: (v) => "something broke",
      })({ _tag: "A", num: 2 })
    ).toBe(4);

    expect(
      match<Set>()({
        A: (v) => v.num * 2,
        B: (v) => "Hello " + v.str,
        Unknown: (v) => "something broke",
      })({ _tag: "B", str: "world" })
    ).toBe("Hello world");

    // invalid: no tag on value
    expect(
      match<Set>()({
        A: (v) => v.num * 2,
        B: (v) => "Hello " + v.str,
        Unknown: (v) => "something broke",
      })({ num: 2 } as A)
    ).toBe("something broke");

    // invalid: wrong tag on value
    expect(
      match<Set>()({
        A: (v) => v.num * 2,
        B: (v) => "Hello " + v.str,
        Unknown: (v) => "something broke",
      })(({ _tag: "wrong", num: 2 } as unknown) as A)
    ).toBe("something broke");
  });
});
