type Tagged = { _tag: string };

type TagMap<T extends Tagged> = {
  [K in T["_tag"]]: T extends { _tag: K } ? T : never;
} & { [key: string]: any };

export type Pattern<S extends Tagged> = {
  [K in keyof TagMap<S>]: (v: TagMap<S>[K]) => any;
} & { Unknown: (v: unknown) => any };

type PatternReturnType<P extends Pattern<any>> = {
  [K in keyof P]: ReturnType<P[K]>;
}[keyof P];

export function match<S extends Tagged>() {
  return <P extends Pattern<S>>(p: P) => <A extends S>(
    v: A
  ): PatternReturnType<P> => {
    if ("_tag" in v && v._tag in p) {
      return p[v._tag](v);
    }
    return p["Unknown"](v);
  };
}
