# tree-exchange

## binary hash trees

Split a file into N blocks of size S. Allocate an array
of size 2N `tree`, hash each block of the file, and store
it's hash in the odd numbered slots into `tree`.

``` js
tree[1] = hash(block[0])
tree[3] = hash(block[1])
//in general:
tree[2*i + 1] = hash(block[i])
```

just leaving the 0th slot in the tree empty to remove a `- 1`
from the rest of the calculations)

In the even numbered indexes, store the hashes of the hashes.

``` js
tree[2] = hash(tree[1] + tree[3])
tree[6] = hash(tree[5] + tree[7])
//and then tree[4] is the hash of these two hashes.
tree[4] = hash(tree[2] + tree[6])
```

For example, a hash tree with 8 leaves would look like this:

```
 1        ,8527a891e224136950ff32ca212b45bc
 2      ,e9827188f4a6ba43d117f58d67a8e58c
 3      | `3fdba35f04dc8c462986c992bcf87554
 4   ,-a54dddac114624307e5939d18ef13f41
 5   |  | ,6b51d431df5d7f141cbececcf79edf3d
 6   |  `f43d56daa208a87c13fd2ed6e00be955
 7   |    `4fc82b26aecb47d2868c4efbe3581732
 8   ba065319fd0e7f47d8337389baa2ffb4
 9   |    ,4a44dc15364204a80fe80e9039455cc1
10   |  ,1dd26b1e53132290f5b62a8de7c8c999
11   |  | `19581e27de7ced00ff1ce50b2047e7a5
12   `-4f767ffe9c957b981ad0c8f9e2e6199d
13      | ,2c624232cdd221771294dfbb310aca00
14      `719d17bcc5d07bb56891dc75ce4ef931
15        `7902699be42c8a8e46fbbb4501726517
```

now, the file as a whole can be identified with the top hash,
`ba065319...`, but, given some block from the file,
and it's _brother hash_, and it's _uncle hashes_ it's
possible to verify the block is indeed a part of this file.

Say, if you had the first block of an 8 block file,
you'd also need the 3rd, 6th, and 12th hash.
This would allow you to reconstruct the 2nd, 4th, and 8th
hash. The 8th hash is the root, and reconstructing the 8th
hash correctly proves that the given block is a valid part of
the file. It is infeasible for an attacker to find hashes
that hashed with a incorrect block happened to produce the correct
top hash.

## hash height

note that the hash heigh is the number of factors of 2.
Odd numbered hashes are all leaves (hashes of actual blocks)
but if a hash's index is divisible by 2, then it is the hash
of other hashes. The number of times it's divisible by 2
determines the height of the hash, and the highest hash
(the top hash) is the root of the tree.

## unbalanced trees

If the number of blocks in the file is a power of 2 then
the tree will be symmetrical. In all other cases, the tree
will be unsymmetrical. One approach to handle this case would
be to fill in the tree with hashes of the empty string,
but that would unnecessarily use bandwidth, so a better approach
is to take the next highest hash.

```

 1      ,ef2d127de37b942baad06145e54b0c61
 2   ,-e56987d0c12dad393c1b951202b0bafb
 3   |  `4b227777d4dd1fc61c6f884f48641d02
 4 ,-60e56a778618f95474cc0929301a8d94
 5 | |  ,4e07408562bedb8b60ce05c1decfe3ad
 6 | `-8d16e0bf60e25c5a25a61dd3a28a36fe
 7 |    `d4735e3a265e16eee03f59718b9b5d03
 8 28b6fec0d772bd83d3bf0bd59df0f790
 9 |    ,6b86b273ff34fce19d6b804eff5a3f57
10 `---2ed8686655b019bfe98432d461a3387e
11      `5feceb66ffc86f38d952786c6d696c79
```

This tree has 6 blocks, and the 8th hash is the combination
of the 4th hash and the 10th hash (instead of the 12th hash)

In this case, the _father hash_ of 10 should be 12, but that
is not hash is not in the tree, so the _first son_ of 12
(which is 10) becomes the hash of that family.

If this tree instead only had 5 blocks, 8 would be the hash
of the 4th hash and the 9th hash. In that case, neither
the 12th or 10th hash is in the tree, so instead of using the
first son of 12, we use the first _grandson_, which is 9.

## transferring blocks, with verification hashes.

when transferring a block, the hashes and metadata
required to verify that block are also sent. For simplicity,
the hashes required to verify any particular block are 
always sent with that block.
So if packets are dropped, corrupted, or out of order
it's still possible to verify any particular block.

## License

MIT
