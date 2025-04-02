import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from mpl_toolkits.mplot3d import Axes3D
import math

# 사용자로부터 위도 입력 받기
lat = float(input("위도를 도 단위로 입력하세요: "))

# 상수 (지구 반지름, 단위: km)
a = 6378.139  # 적도 반지름
b = 6356.139  # 극 반지름
T = 23 + 56/60  # 항성일 (23시간 56분 ≈ 23.9333시간)

# 위도를 라디안으로 변환
lat_rad = math.radians(lat)

# x_seta 계산 (회전축으로부터의 거리)
x_seta = ((a**2 * b**2) / (b**2 + a**2 * (math.tan(lat_rad))**2))**0.5

# 시간 배열 (0부터 T까지, 1000 프레임)
n = np.linspace(0, T, 1000)  # 단위: 시간

# 각도 변위 (도 단위로 계산 후 라디안으로 변환)
phi_deg = (5400 / 359) * n
phi_rad = np.deg2rad(phi_deg)

# 위치 계산 (y는 0으로 고정)
x = x_seta * np.cos(phi_rad)
y = np.zeros_like(n)  # y는 0으로 고정
z = -x_seta * np.sin(phi_rad)

# 3D 그래프 설정
fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')
ax.set_xlim(-x_seta * 1.1, x_seta * 1.1)
ax.set_ylim(-x_seta * 1.1, x_seta * 1.1)
ax.set_zlim(-x_seta * 1.1, x_seta * 1.1)
ax.set_xlabel('X (km)')
ax.set_ylabel('Y (km)')
ax.set_zlabel('Z (km)')
ax.set_title(f'3D 원운동 (위도 {lat}°, 1시간 ≈ 1초)')

# 움직이는 점 초기화 (크기를 10으로 설정해 크게 만듦)
point, = ax.plot([], [], [], 'ro', markersize=10, label='물체 위치')

# 궤적을 그릴 선 초기화
trail, = ax.plot([], [], [], 'b-', linewidth=2, label='운동 경로')

# 시간 표시를 위한 텍스트 객체 추가
time_text = ax.text2D(0.05, 0.95, "", transform=ax.transAxes, fontsize=12)

ax.legend()

# 궤적을 저장할 리스트
trail_x = []
trail_y = []
trail_z = []

# 애니메이션 초기화 함수
def init():
    point.set_data([], [])
    point.set_3d_properties([])
    trail.set_data([], [])
    trail.set_3d_properties([])
    time_text.set_text("")  # 초기 텍스트 비우기
    return point, trail, time_text

# 애니메이션 업데이트 함수
def animate(i):
    # 현재 위치 업데이트
    point.set_data([x[i]], [y[i]])          # x와 y 좌표를 리스트로 전달
    point.set_3d_properties([z[i]])         # z 좌표를 리스트로 전달
    
    # 궤적에 현재 위치 추가
    trail_x.append(x[i])
    trail_y.append(y[i])
    trail_z.append(z[i])
    
    # 궤적 업데이트
    trail.set_data(trail_x, trail_y)        # 궤적의 x, y 좌표 업데이트
    trail.set_3d_properties(trail_z)        # 궤적의 z 좌표 업데이트
    
    # 시간 계산 및 표시 (시간과 분으로 변환)
    hours = int(n[i])  # 정수 시간
    minutes = int((n[i] - hours) * 60)  # 소수점 부분을 분으로 변환
    time_text.set_text(f"시간: {hours}시간 {minutes}분")
    
    return point, trail, time_text

# 애니메이션 생성
# 1시간 ≈ 1초: 전체 주기 23.9333시간 ≈ 24초, interval = 24초 / 1000프레임 ≈ 24ms
anim = FuncAnimation(fig, animate, init_func=init, frames=len(n), interval=24, blit=False)

plt.show()
