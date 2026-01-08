export const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const DEFAULT_PYTHON_CODE = `import sys

def solve():
    # 입력을 받기 위해 sys.stdin.readline() 사용 권장
    pass

if __name__ == "__main__":
    solve()
`;

export const DEFAULT_CPP_CODE = `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // 여기에 코드를 작성하세요
    
    return 0;
}
`;
